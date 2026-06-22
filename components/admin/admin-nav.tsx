import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/teams", label: "Teams" },
] as const;

type AdminNavProps = {
  adminEmail: string;
};

export function AdminNav({ adminEmail }: AdminNavProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Rusty Wedge Admin
          </p>
          <p className="text-xs text-zinc-500">{adminEmail}</p>
        </div>
        <nav aria-label="Admin" className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
