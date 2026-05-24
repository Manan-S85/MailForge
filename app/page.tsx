import Link from "next/link";
import { MailIcon, SparklesIcon, FileTextIcon, SmartphoneIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: FileTextIcon,
    title: "Rich Editor",
    desc: "Write email templates with Tiptap — tables, images, code blocks, colors, and more.",
  },
  {
    icon: SparklesIcon,
    title: "AI Assistant",
    desc: "Generate, rewrite, shorten, or improve your email content with Google Gemini.",
  },
  {
    icon: SmartphoneIcon,
    title: "Live Preview",
    desc: "See how your emails look on desktop and mobile before sending.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
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
        <section className="flex flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <MailIcon className="size-7" />
          </div>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Email templates,{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                powered by AI
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Create, preview, and test beautiful email templates without engineering. Built with AI to help you write better emails faster.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started free
                <ArrowRightIcon className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="space-y-3 rounded-xl border p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; 2026 MailTemplates. Built with Next.js and Supabase.
      </footer>
    </div>
  );
}
