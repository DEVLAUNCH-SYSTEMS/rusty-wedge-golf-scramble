import Link from "next/link";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { BrandLogo } from "@/components/marketing/brand-logo";

type AdminNavProps = {
  adminEmail: string;
};

function AdminNavBrand() {
  return (
    <div className="flex items-center gap-3">
      <BrandLogo size="nav" />
      <div>
        <p className="font-display text-lg leading-tight text-white">
          Organizer Dashboard
        </p>
        <p className="text-xs text-white/70">The Rusty Wedge Golf Scramble</p>
      </div>
    </div>
  );
}

function AdminNavMeta({ adminEmail }: AdminNavProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <p className="text-xs text-white/70">
        Signed in as <span className="font-medium text-white">{adminEmail}</span>
      </p>
      <Link
        href="/"
        className="text-xs font-medium text-rw-gold transition hover:text-rw-gold-light"
      >
        View public site
      </Link>
    </div>
  );
}

export function AdminNav({ adminEmail }: AdminNavProps) {
  return (
    <header className="bg-rw-navy text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminNavBrand />
          <AdminNavMeta adminEmail={adminEmail} />
        </div>
        <div className="mt-4">
          <AdminNavLinks />
        </div>
      </div>
      <div className="h-1 bg-rw-gold" aria-hidden />
    </header>
  );
}
