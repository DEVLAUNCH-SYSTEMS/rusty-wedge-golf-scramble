import Link from "next/link";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { MarketingButton } from "@/components/marketing/marketing-buttons";
import { NAV_LINKS } from "@/lib/content/landing-content";

function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-white">
      <BrandLogo size="nav" />
      <span className="hidden flex-col text-sm font-semibold leading-tight sm:flex">
        <span>The</span>
        <span>Rusty Wedge</span>
      </span>
    </Link>
  );
}

function SiteNav() {
  return (
    <nav aria-label="Primary" className="hidden gap-6 text-sm text-white/90 lg:flex">
      {NAV_LINKS.map((link) => (
        <a key={link.href} href={link.href} className="hover:text-rw-gold">
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <SiteLogo />
        <SiteNav />
        <MarketingButton href="#register" variant="gold" className="px-5 py-2 text-xs">
          Register Now
        </MarketingButton>
      </div>
    </header>
  );
}
