import Link from "next/link";

import { BrandLogo } from "@/components/marketing/brand-logo";

type AuthPageShellProps = {
  children: React.ReactNode;
};

function AuthPageIntro() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <BrandLogo size="auth" />
      <p className="font-display mt-5 text-3xl text-white">Organizer Sign In</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">
        Sign in to review registrations, verify payments, and manage the tournament.
      </p>
    </div>
  );
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="organizer-auth relative flex min-h-full flex-col bg-rw-navy">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--rw-gold)_12%,transparent),transparent_55%)]"
        aria-hidden
      />
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AuthPageIntro />
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl md:p-8">
            {children}
          </div>
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-white/70 transition hover:text-rw-gold"
          >
            ← Back to tournament site
          </Link>
        </div>
      </main>
    </div>
  );
}
