# MailForge

MailForge is a modern, secure **email template management platform** built for teams that need to create, preview, iterate, and safely send email content without engineering bottlenecks.

It combines a **rich WYSIWYG editor** (Tiptap) with **placeholder-aware templating**, **live previews using mock data**, **test sends via Resend**, and an **AI assistant** (OpenRouter) that rewrites and generates copy while preserving your `{{placeholders}}`.

---

## What you can do

- **Authenticate users** (Supabase Auth) with email/password.
- **Create and manage templates** with status (`draft`, `active`, `archived`) and optional categories.
- **Edit rich email content** (headings, lists, links, underline, tables, code blocks, images).
- **Use placeholders** like `{{first_name}}` and preview how emails render with JSON mock data.
- **Generate or rewrite content with AI** (tone-aware actions; placeholders preserved).
- **Send test emails** via Resend and track send history.
- **Seed sample data** (categories, placeholders, templates) per user to get started fast.

---

## Tech stack

- **App**: Next.js (App Router) + React
- **UI**: Tailwind CSS + shadcn/ui components
- **Database/Auth**: Supabase (Postgres + RLS, Supabase Auth)
- **Editor**: Tiptap (rich text) + custom placeholder extensions
- **Email delivery**: Resend (test sends)
- **AI**: OpenRouter (chat completions with fallback free models)

---

## Product architecture (high level)

MailForge is a server-rendered Next.js application. Supabase is used in two ways:

- **Server components / server actions** use a Supabase server client wired to Next.js cookies.
- **Row Level Security (RLS)** enforces that each authenticated user can only access their own rows.

Email content is treated as **untrusted input** and is sanitized before storage and before rendering.

---

## Routes and user flows

### Public/auth

- `/login` — sign in
- `/signup` — create account

### Dashboard

- `/dashboard` — overview (recent templates + recent activity)
- `/dashboard/templates` — list, filter, duplicate, delete, and browse prebuilt templates
- `/dashboard/templates/new` — create a template shell
- `/dashboard/templates/[id]` — full editor (content + preview + AI + test send)

### API

- `POST /api/seed` — seeds the authenticated user with sample categories, placeholders, and templates (no-op if user already has data)

---

## Environment variables

Copy the example env file and fill in values:

```bash
cp .env.example .env.local
```

If you use the provided schema setup script (see below), also create a `.env` file because the script reads from `.env`:

```bash
cp .env.example .env
```

Required variables (see [.env.example](.env.example)):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `RESEND_API_KEY` — Resend API key (required for test sends)
- `RESEND_FROM` — verified Resend sender (e.g. `onboarding@your-domain.com`)
- `OPENROUTER_API_KEY` — OpenRouter key (required for AI assistant)

---

## Database setup (Supabase)

The database schema lives in [supabase/schema.sql](supabase/schema.sql) and includes:

- `categories` — user-owned categories
- `placeholders` — user-owned placeholder dictionary (key + description + sample value)
- `templates` — email templates (subject + Tiptap HTML/JSON + extracted placeholder list + status)
- `email_logs` — logs for test sends (status + provider message ID)
- `ai_logs` — logs for AI actions (action, model, token usage where available)
- `rate_limit_counters` + `rate_limit_increment()` — simple per-user per-action counters for rate limiting

All user data tables have **RLS enabled** with policies that restrict access to `owner_id = auth.uid()`.

### Option A: Apply schema manually

1. Create a Supabase project
2. Open Supabase Dashboard → SQL Editor
3. Paste the contents of [supabase/schema.sql](supabase/schema.sql) and run it

### Option B: Apply schema via the included script

This repo includes a helper that calls the Supabase Management API to apply the schema:

```bash
node scripts/setup-db.mjs <your-supabase-personal-access-token>
```

Notes:

- Create a Personal Access Token in Supabase Dashboard → Account → Tokens.
- The script extracts your project ref from `NEXT_PUBLIC_SUPABASE_URL` in `.env`.

---

## Running locally

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Other useful commands:

```bash
npm run build
npm run start
npm run lint
npm run typecheck
```

---

## Core product behaviors (important details)

### 1) Placeholders

- Placeholder syntax is `{{ key }}` (spaces are allowed inside braces).
- Allowed placeholder keys match: `^[a-zA-Z0-9_.-]+$`.
- When you save a template, MailForge:
	- sanitizes the HTML,
	- extracts placeholders from **subject + body**,
	- stores the placeholder list on the template.

### 2) Preview rendering

Templates can be previewed using a JSON object of mock data.

- Missing values render as empty strings.
- Placeholder values are inserted into the HTML as **escaped text** (to prevent injection).
- Preview rendering returns a full HTML document wrapper suitable for email clients.

### 3) HTML sanitization

Email HTML is sanitized (allowlist-based) before storage and before rendering. Links are forced to open in a new tab with safe `rel` attributes.

### 4) “Button link” rendering

If an anchor tag is marked with `data-button="true"`, rendering applies email-safe inline button styling.

### 5) AI assistant

The AI assistant uses OpenRouter’s chat-completions API.

- Supports actions like: generate, rewrite tone, shorten, expand, generate CTA, generate subject lines, fix grammar, etc.
- Applies per-user rate limiting.
- Logs actions to `ai_logs` including model used and token counts (when returned by provider).
- Enforces a critical rule: **placeholders like `{{first_name}}` must be preserved exactly**.

### 6) Test email sending

Test sends go through Resend.

- Rate limited per-user.
- Each attempt (success or failure) is logged to `email_logs`.
- The editor UI shows recent send history for the template.

---

## Seed data (prebuilt templates)

MailForge ships with a set of **prebuilt templates** and default categories/placeholders.

- You can browse prebuilt templates immediately.
- Clicking “Save to my account” seeds your own rows (categories, placeholders, templates) under your user.

---

## Security model

- **Supabase RLS** prevents cross-user access.
- **HTML sanitization** reduces risk from unsafe content in templates.
- **Placeholder substitution escapes HTML** (values are treated as plain text).
- **Rate limiting** is implemented in Postgres via `rate_limit_increment()` and is designed to **fail closed**.

---

## Middleware note (auth redirects)

This repo contains auth/session middleware logic in [proxy.ts](proxy.ts), which refreshes Supabase sessions and redirects:

- Unauthenticated users away from `/dashboard/*` to `/login`
- Authenticated users away from `/login` and `/signup` to `/dashboard`

In a standard Next.js setup, middleware runs from `middleware.ts`. If you want this behavior enabled, re-export the `proxy` function from a `middleware.ts` file.

---

## Troubleshooting

### “Some tables may not exist yet”

Apply the schema from [supabase/schema.sql](supabase/schema.sql) and refresh.

### AI assistant says “OPENROUTER_API_KEY not configured”

Set `OPENROUTER_API_KEY` in your env file(s) and restart the dev server.

### Resend send fails

- Confirm `RESEND_API_KEY` is valid.
- Confirm `RESEND_FROM` is a verified sender/domain in Resend.

---

## License

ISC (see package metadata).
