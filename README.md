<p align="center">
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#111111"/>
    <path d="M14 18C14 16.8954 14.8954 16 16 16H32C33.1046 16 34 16.8954 34 18V30C34 31.1046 33.1046 32 32 32H16C14.8954 32 14 31.1046 14 30V18Z" stroke="white" stroke-width="1.5" fill="none"/>
    <path d="M14 20L24 26L34 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 28H28" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M20 24H24" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</p>

<h1 align="center">MailForge</h1>

<p align="center">
  A modern email template management platform — create, preview, and send<br />
  beautiful email templates with AI-powered assistance.
</p>

<br />

---

<br />

## Getting Started locally

Follow these steps to run MailForge on your computer. You will need a few free accounts — the guide below walks you through everything.

<br />

### What you will need

<table>
  <tr>
    <td width="48" valign="top" align="center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </td>
    <td><strong>Node.js</strong> — the engine that runs the app.<br />Download from <a href="https://nodejs.org">nodejs.org</a> (install the LTS version).</td>
  </tr>
  <tr>
    <td width="48" valign="top" align="center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </td>
    <td><strong>A code editor</strong> (optional) — to edit files.<br />Download <a href="https://code.visualstudio.com">VS Code</a> (it is free).</td>
  </tr>
</table>

> You should already have the project folder on your computer — either by downloading the ZIP file or by receiving it from your team. If not, ask your team for a copy of the `email-template-management` folder.

<br />

### Step 1 — Open the project folder

Open your terminal (Command Prompt on Windows, Terminal on Mac) and navigate to the project folder:

```bash
cd path/to/email-template-management
```

> Replace `path/to/` with the actual location of the folder on your computer. For example: `cd Desktop/email-template-management`

<br />

### Step 2 — Create a Supabase account (free)

Supabase is the database that stores your templates and users.

1. Go to <a href="https://supabase.com">supabase.com</a> and click **Start your project**.
2. Sign up with GitHub or email.
3. Once logged in, click **New project**.
4. Give your project a name (e.g. `MailForge`).
5. Set a secure database password — **save this password somewhere safe**.
6. Choose a region close to you and click **Create new project**.
7. Wait about a minute for the database to be ready.

<br />

### Step 3 — Set up the database tables

Once your Supabase project is ready:

1. In the Supabase dashboard, go to the **SQL Editor** tab (left sidebar).
2. Click **New query**.
3. Open the file `supabase/schema.sql` from the MailForge folder in a text editor.
4. Copy the entire contents of that file.
5. Paste it into the SQL Editor in Supabase and click **Run**.
6. You should see a success message. The database is now ready.

<br />

### Step 4 — Get your Supabase API keys

1. In the Supabase dashboard, go to **Project Settings** (gear icon) &rarr; **API**.
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`).
3. Copy the **anon public key** (a long string starting with `eyJ...`).

<br />

### Step 5 — Create a Resend account (free)

Resend sends the test emails.

1. Go to <a href="https://resend.com">resend.com</a> and sign up.
2. In the dashboard, go to **API Keys** and create a new API key.
3. Copy the key (it starts with `re_`).
4. Go to **Domains** and add a domain you own, or use the sandbox domain provided by Resend for testing. Copy the sender email address (e.g. `onboarding@resend.dev`).

<br />

### Step 6 — Create an OpenRouter account (free)

OpenRouter powers the AI assistant.

1. Go to <a href="https://openrouter.ai/keys">openrouter.ai/keys</a> and sign up.
2. Click **Create key**.
3. Copy the API key.

<br />

### Step 7 — Configure the app

1. In the MailForge folder, find the file named `.env.example`.
2. Create a copy of this file and name it `.env`.
3. Open `.env` in a text editor and fill in the values you copied:

```bash
# Supabase (from Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend (from Step 5)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=onboarding@your-domain.com

# OpenRouter (from Step 6)
OPENROUTER_API_KEY=your-openrouter-api-key
```

> Replace everything after the `=` signs with your actual keys. Keep the quotes off.

<br />

### Step 8 — Install and start

```bash
# Install dependencies (this downloads all required packages)
npm install

# Start the app
npm run dev
```

Once the command finishes, open your browser and go to:

<p align="center">
  <a href="http://localhost:3000"><strong>http://localhost:3000</strong></a>
</p>

<br />

### Step 9 — Create your account

1. Click **Get started** on the landing page.
2. Sign up with your email and a password.
3. You will be taken to your dashboard.
4. Visit `/api/seed` in your browser (add it after `http://localhost:3000`) to populate the app with sample templates and placeholders.

<br />

---

<br />

## Features

<table>
  <tr>
    <td width="40" valign="top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </td>
    <td><strong>Rich template editor</strong> — A full-featured editor with headings, lists, tables, images, links, and more. What you see is what you get.</td>
  </tr>
  <tr>
    <td width="40" valign="top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    </td>
    <td><strong>Live preview</strong> — See exactly how your email looks as you type, with desktop and mobile views.</td>
  </tr>
  <tr>
    <td width="40" valign="top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </td>
    <td><strong>Placeholder variables</strong> — Use <code>{{first_name}}</code>, <code>{{company_name}}</code> and insert real data when previewing or sending.</td>
  </tr>
  <tr>
    <td width="40" valign="top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    </td>
    <td><strong>AI assistant</strong> — Generate subject lines, rewrite content, fix grammar, and more — all while preserving your placeholders.</td>
  </tr>
  <tr>
    <td width="40" valign="top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22 6 12 13 2 6"/>
      </svg>
    </td>
    <td><strong>Test sending</strong> — Send real test emails to yourself before using a template. Full send history is tracked.</td>
  </tr>
</table>

<br />

---

<br />

## Project structure

```
email-template-management/
├── app/                    # Application pages and layouts
│   ├── dashboard/          # Dashboard (home, templates, editor)
│   ├── login/              # Sign in page
│   ├── signup/             # Create account page
│   ├── globals.css         # Global styles
│   └── page.tsx            # Landing page
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components (button, input, etc.)
│   │   ├── templates/      # Template editor, AI assistant, send test
│   │   ├── layout/         # Sidebar, header, navigation
│   │   └── editor/         # TipTap editor extensions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities (email rendering, placeholders)
│   ├── server/             # Server actions (auth, templates, AI, email)
│   └── types/              # TypeScript type definitions
├── supabase/
│   └── schema.sql          # Database schema (run this in Supabase)
├── scripts/
│   └── setup-db.mjs        # Optional automated DB setup script
├── .env.example            # Environment variable template
└── package.json            # Project dependencies and scripts
```

<br />

---

<br />

## Available commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app in development mode (for building/testing) |
| `npm run build` | Create an optimized production build |
| `npm start` | Start the production server (after building) |
| `npm run lint` | Check code for errors and style issues |
| `npm run typecheck` | Verify TypeScript types are correct |

<br />

---

<br />

## Troubleshooting

<table>
  <tr>
    <td width="32" valign="top">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </td>
    <td><strong>"Some tables may not exist yet"</strong> — You need to run the schema from <code>supabase/schema.sql</code> in the Supabase SQL Editor.</td>
  </tr>
  <tr>
    <td width="32" valign="top">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </td>
    <td><strong>"OPENROUTER_API_KEY not configured"</strong> — Set your OpenRouter key in <code>.env</code> and restart the app.</td>
  </tr>
  <tr>
    <td width="32" valign="top">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </td>
    <td><strong>Resend send fails</strong> — Make sure your API key is correct and your sender email is verified in Resend.</td>
  </tr>
  <tr>
    <td width="32" valign="top">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </td>
    <td><strong>"npm not found"</strong> — Node.js is not installed. Download it from <a href="https://nodejs.org">nodejs.org</a> and try again.</td>
  </tr>
</table>

<br />

---

<br />

<p align="center">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
  <br />
  <sub>Built with Next.js, Supabase, TipTap, Resend, and OpenRouter</sub>
</p>
