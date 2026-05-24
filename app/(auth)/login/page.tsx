import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { FileTextIcon, SparklesIcon, SmartphoneIcon } from "lucide-react";

const features = [
  { icon: FileTextIcon, text: "Rich email template editor" },
  { icon: SparklesIcon, text: "AI-powered content generation" },
  { icon: SmartphoneIcon, text: "Live mobile & desktop preview" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-dvh">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-12 text-white lg:flex">
        <Logo size="md" />

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;This tool saved us hours of back-and-forth with engineering. Our marketing team ships emails in minutes.&rdquo;
            </p>
            <footer className="text-sm text-white/70">— Product Manager, SaaS Co.</footer>
          </blockquote>

          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="size-4" />
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">© 2026 MailTemplates. All rights reserved.</p>
      </div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to create, preview, and test email templates.
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-indigo-600 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
