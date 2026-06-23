"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/registrations", label: "Registrations", exact: false },
  { href: "/admin/waitlist", label: "Waitlist", exact: false },
  { href: "/admin/teams", label: "Teams", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClassName(active: boolean): string {
  if (active) {
    return "rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-rw-gold";
  }

  return "rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white";
}

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={navLinkClassName(isActive(pathname, item.href, item.exact))}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
