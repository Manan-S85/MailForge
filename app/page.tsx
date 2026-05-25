import Link from "next/link";
import {
  SparklesIcon,
  FileTextIcon,
  SmartphoneIcon,
  ArrowRightIcon,
  BlocksIcon,
  PaletteIcon,
  EyeIcon,
  SendIcon,
  TerminalIcon,
  DatabaseIcon,
  ZapIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileTextIcon,
    title: "Rich Editor",
    desc: "Write with tables, images, code blocks, colors, and placeholders. Full Tiptap-powered editing experience.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: SparklesIcon,
    title: "AI Assistant",
    desc: "Generate, rewrite, shorten, or improve content. Smart tone control and contextual suggestions.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: SmartphoneIcon,
    title: "Live Preview",
    desc: "See desktop and mobile renders instantly. Send test emails to your inbox with one click.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Write with placeholders",
    desc: "Use {{variable}} syntax to personalize every email. The editor highlights placeholders and suggests values from your library.",
  },
  {
    number: "02",
    title: "Preview with real data",
    desc: "Apply JSON mock data to see exactly how the email renders. Toggle between desktop and mobile views instantly.",
  },
  {
    number: "03",
    title: "Test-send before you ship",
    desc: "Send a real email to your inbox via Resend. Full send history is logged so you know what went out and when.",
  },
];

const useCases = [
  {
    icon: UsersIcon,
    title: "Marketing teams",
    desc: "Design and iterate on campaigns without waiting for engineering. Preview and test in minutes.",
  },
  {
    icon: TerminalIcon,
    title: "Developers",
    desc: "Define placeholder schemas, seed test data, and integrate with any email provider. Open-source and self-hosted.",
  },
  {
    icon: BlocksIcon,
    title: "Product builders",
    desc: "Ship onboarding flows, transactional emails, and notifications with confidence. Full control over every pixel.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-sm">
        <Logo />
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.9_0.02_240),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,oklch(0.2_0.05_240),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ZapIcon className="size-3 text-amber-500" />
              Open-source email template platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Email templates,{" "}
              <span className="bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-violet-400 dark:to-emerald-400">
                powered by AI
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              A self-hosted platform for teams that need to create, preview, and 
              send beautiful email templates without engineering bottlenecks. 
              Rich editor, live preview, AI copywriting, and test sending — all in one place.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get started
                  <ArrowRightIcon className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Editor Showcase ── */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-muted-foreground">editor.tsx — MailForge</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Saved
                  </span>
                </div>
              </div>
              {/* Editor content */}
              <div className="p-5">
                <div className="mb-3 flex items-center gap-1 border-b pb-3">
                  <div className="flex items-center gap-0.5">
                    {["B", "I", "U", "H1", "H2"].map((label) => (
                      <span key={label} className="flex size-7 items-center justify-center rounded-md text-xs font-medium text-muted-foreground hover:bg-accent">{label}</span>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    {["\u2022", "1.", "\u2039", "\u203A"].map((label) => (
                      <span key={label} className="flex size-7 items-center justify-center rounded-md text-lg text-muted-foreground hover:bg-accent">{label}</span>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <span className="flex size-7 items-center justify-center rounded-md bg-accent text-muted-foreground hover:bg-accent/80">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </span>
                  </div>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <h2 className="text-xl font-bold tracking-tight">{'{{company_name}}'} — Welcome aboard</h2>
                  <p>Hi {'{{first_name}}'},</p>
                  <p>Thanks for signing up for <strong>{'{{product_name}}'}</strong>. We are excited to have you on board.</p>
                  <p>Here is what you can do next:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Complete your <a href="#" className="text-sky-600 underline dark:text-sky-400">profile setup</a></li>
                    <li>Explore the dashboard and create your first project</li>
                    <li>Invite your team members to collaborate</li>
                  </ul>
                  <div className="inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
                    Get started
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mb-14 text-center">
              <h2 className="text-lg font-semibold">How it works</h2>
              <p className="mt-1 text-sm text-muted-foreground">Three steps from blank page to sent email</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.number} className="relative">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-card text-xs font-semibold text-muted-foreground">
                    {step.number}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="absolute -right-4 top-5 hidden text-muted-foreground/30 md:block">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 4l6 6-6 6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mb-14 text-center">
              <h2 className="text-lg font-semibold">Everything you need to ship emails</h2>
              <p className="mt-1 text-sm text-muted-foreground">A complete toolkit for modern email teams</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
                  <div className={`mb-3 flex size-9 items-center justify-center rounded-lg ${f.bg} ${f.color}`}>
                    <f.icon className="size-4" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Preview Showcase ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <Badge variant="secondary" className="mb-3">Preview</Badge>
                <h2 className="mb-3 text-lg font-semibold">See it before you send it</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Apply JSON data to your template and see exactly how each email renders. 
                  Toggle between desktop and mobile viewports. Every placeholder is 
                  highlighted in the editor and replaced with your test data in the preview.
                </p>
                <ul className="mt-4 space-y-2">
                  {["Real-time preview as you type", "Desktop and mobile viewports", "JSON mock data for placeholders", "Test send to your inbox"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-emerald-500">
                        <path d="M13.5 4.5l-7.5 7.5-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-950">
                <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-2">
                  <div className="size-2 rounded-full bg-red-400" />
                  <div className="size-2 rounded-full bg-amber-400" />
                  <div className="size-2 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[10px] text-muted-foreground">Preview</span>
                  <div className="ml-auto inline-flex items-center gap-0.5 rounded-md border bg-card p-0.5">
                    <span className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Desktop</span>
                    <span className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Mobile</span>
                  </div>
                </div>
                <div className="p-4 text-sm leading-relaxed">
                  <div className="mb-3">
                    <div className="text-[10px] text-neutral-400">Subject: Welcome to Acme</div>
                  </div>
                  <h2 className="mb-1 text-base font-bold">Welcome to Acme</h2>
                  <p className="mb-1 text-neutral-600 dark:text-neutral-400">Hi Sarah,</p>
                  <p className="mb-1 text-neutral-600 dark:text-neutral-400">
                    Thanks for signing up for <strong>Acme</strong>. We are excited to have you on board.
                  </p>
                  <div className="mt-3 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
                    Get started
                  </div>
                  <p className="mt-3 text-xs text-neutral-400">Sent via MailForge</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Use cases ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mb-14 text-center">
              <h2 className="text-lg font-semibold">Built for teams that ship emails</h2>
              <p className="mt-1 text-sm text-muted-foreground">From marketing campaigns to transactional notifications</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {useCases.map((uc) => (
                <div key={uc.title} className="rounded-xl border bg-card p-5">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <uc.icon className="size-4" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold capitalize">{uc.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech stack ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mb-10 text-center">
              <h2 className="text-lg font-semibold">Built with modern tools</h2>
              <p className="mt-1 text-sm text-muted-foreground">Self-hosted on your own infrastructure</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: DatabaseIcon, label: "Supabase" },
                { icon: TerminalIcon, label: "Next.js" },
                { icon: PaletteIcon, label: "Tailwind CSS" },
                { icon: EyeIcon, label: "TipTap Editor" },
                { icon: SendIcon, label: "Resend" },
                { icon: SparklesIcon, label: "OpenRouter AI" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section>
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <h2 className="mb-2 text-lg font-semibold">Ready to ship better emails?</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Self-hosted, full control over your data. Get started in minutes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get started
                  <ArrowRightIcon className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" />
          <span className="text-xs text-muted-foreground">
            &copy; 2026 MailForge. Open-source.
          </span>
        </div>
      </footer>
    </div>
  );
}
