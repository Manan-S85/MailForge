import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboardIcon" },
  { href: "/dashboard/templates", label: "Templates", icon: "FileTextIcon" },
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
    <div className="flex min-h-dvh">
      <aside className="hidden w-56 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav items={navItems} />
        </div>

        <div className="border-t px-4 py-3">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="truncate text-sm font-medium">{user.email}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm">
          <MobileNav items={navItems} />
          <div className="flex-1" />
          <ThemeToggle />
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/templates/new">
              <PlusIcon className="size-3.5" />
              New template
            </Link>
          </Button>
          <LogoutButton />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
