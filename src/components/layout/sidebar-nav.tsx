import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function SidebarNav({
  items,
}: {
  items: Array<{ href: string; label: string; badge?: string }>;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <span>{item.label}</span>
          {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
        </Link>
      ))}
    </nav>
  );
}
