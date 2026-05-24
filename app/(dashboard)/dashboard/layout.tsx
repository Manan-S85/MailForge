import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/templates", label: "Templates" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
        <aside className="hidden w-64 flex-col border-r bg-sidebar px-4 py-6 md:flex">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Logo size="sm" />
            </Link>
            <Button asChild size="sm">
              <Link href="/dashboard/templates/new">New</Link>
            </Button>
          </div>

          <Separator className="my-4" />

          <SidebarNav items={navItems} />

          <div className="mt-auto pt-6">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="truncate text-sm">{user.email}</div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 items-center gap-2 px-4">
              <MobileNav items={navItems} />
              <div className="flex-1" />
              <LogoutButton />
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
