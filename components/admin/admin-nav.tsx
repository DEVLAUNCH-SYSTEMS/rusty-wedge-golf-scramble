import Link from "next/link";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { AdminTournamentSelector } from "@/components/admin/admin-tournament-selector";
import { BrandLogo } from "@/components/marketing/brand-logo";

import type { AdminTournamentSelectorData } from "@/lib/services/admin-tournament-selector-data";

type AdminNavProps = {
  adminEmail: string;
  tournamentSelector: AdminTournamentSelectorData;
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

function AdminNavMeta({ adminEmail, tournamentSelector }: AdminNavProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-6 lg:gap-y-2">
      <AdminTournamentSelector
        options={tournamentSelector.options}
        selectedTournamentId={tournamentSelector.selectedTournamentId}
        activeTournamentId={tournamentSelector.activeTournamentId}
      />
      <p className="min-w-0 text-xs break-all text-white/70">
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

export function AdminNav({ adminEmail, tournamentSelector }: AdminNavProps) {
  return (
    <header className="bg-rw-navy text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminNavBrand />
          <AdminNavMeta
            adminEmail={adminEmail}
            tournamentSelector={tournamentSelector}
          />
        </div>
        <div className="mt-4">
          <AdminNavLinks />
        </div>
      </div>
      <div className="h-1 bg-rw-gold" aria-hidden />
    </header>
  );
}
