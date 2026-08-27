import Link from "next/link";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { MarketingButton } from "@/components/marketing/marketing-buttons";
import { PublicNavLinkList } from "@/components/marketing/public-nav-link-list";
import { SiteHeaderMobileNav } from "@/components/marketing/site-header-mobile-nav";

import type { PublicNavLink } from "@/lib/content/landing-content";

function SiteLogo() {
  return (
    <Link href="/" className="flex min-w-0 shrink items-center gap-3 text-white">
      <BrandLogo size="nav" />
      <span className="hidden flex-col text-sm font-semibold leading-tight sm:flex">
        <span>The</span>
        <span>Rusty Wedge</span>
      </span>
    </Link>
  );
}

function SiteNav({ navLinks }: { navLinks: readonly PublicNavLink[] }) {
  return (
    <nav aria-label="Primary" className="hidden lg:flex">
      <PublicNavLinkList
        navLinks={navLinks}
        className="flex gap-6 text-sm text-white/90"
        linkClassName="hover:text-rw-gold"
      />
    </nav>
  );
}

function SiteHeaderActions({
  navLinks,
  registerHref,
}: {
  navLinks: readonly PublicNavLink[];
  registerHref: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <SiteHeaderMobileNav navLinks={navLinks} />
      <MarketingButton href={registerHref} variant="gold" className="shrink-0 px-5 py-2 text-xs">
        Register Now
      </MarketingButton>
    </div>
  );
}

export function SiteHeader({
  navLinks,
  registerHref = "#register",
}: {
  navLinks: readonly PublicNavLink[];
  registerHref?: string;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5">
        <SiteLogo />
        <SiteNav navLinks={navLinks} />
        <SiteHeaderActions navLinks={navLinks} registerHref={registerHref} />
      </div>
    </header>
  );
}
