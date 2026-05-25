import Link from "next/link";
import { MailIcon, SparklesIcon, FileTextIcon, SmartphoneIcon, ArrowRightIcon, CheckCircle2Icon, PaletteIcon, Share2Icon } from "lucide-react";
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

const stats = [
  { label: "Templates created", value: "10,000+" },
  { label: "Emails sent", value: "500,000+" },
  { label: "Active users", value: "2,500+" },
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
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.9_0.02_240),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,oklch(0.2_0.05_240),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pt-20 pb-16 text-center">
            <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <SparklesIcon className="size-3 text-violet-500" />
              AI-powered email template management
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Email templates,{" "}
                <span className="bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-violet-400 dark:to-emerald-400">
                  powered by AI
                </span>
              </h1>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
                Create, preview, and test beautiful email templates without engineering. 
                The fastest way to ship transactional and marketing emails.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/signup">
                  Get started free
                  <ArrowRightIcon className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Mockup */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground">MailTemplates Dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-3 p-4">
                {[
                  { label: "Total templates", value: "12", color: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/20" },
                  { label: "Categories", value: "4", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20" },
                  { label: "Test emails sent", value: "47", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20" },
                  { label: "AI actions", value: "89", color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-lg border bg-gradient-to-br ${stat.color} ${stat.border} p-3`}
                  >
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</div>
                  </div>
                ))}
                <div className="col-span-4 mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">Welcome email</span>
                      <Badge variant="secondary" className="text-[9px]">active</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>May 25, 2026</span>
                    <span className="rounded border px-1 py-0.5 font-mono text-[10px]">Draft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="mb-10 text-center">
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

        {/* Social proof */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-14 text-center">
            <div className="mb-8 flex items-center justify-center gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/signup">
                  Get started free
                  <ArrowRightIcon className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; 2026 MailTemplates. Built with Next.js and Supabase.
      </footer>
    </div>
  );
}
