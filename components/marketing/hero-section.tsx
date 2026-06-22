import { BrandLogo } from "@/components/marketing/brand-logo";
import { MarketingButton } from "@/components/marketing/marketing-buttons";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  HERO_EYEBROW,
  HERO_SECONDARY_CTA,
  HERO_SUPPORTING,
  HERO_TAGLINE,
} from "@/lib/content/landing-content";

function HeroEyebrow() {
  return (
    <p className="mt-2 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-rw-gold">
      <span className="h-px w-8 bg-rw-gold/60" aria-hidden />
      {HERO_EYEBROW}
      <span className="h-px w-8 bg-rw-gold/60" aria-hidden />
    </p>
  );
}

function HeroHeading() {
  return (
    <h1 className="font-display mt-6 text-4xl leading-tight md:text-5xl">
      <span className="block text-white">The Rusty Wedge</span>
      <span className="block text-rw-gold">Golf Scramble</span>
    </h1>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-rw-navy pb-20 pt-28 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 text-center">
        <BrandLogo size="hero" priority className="mx-auto" />
        <HeroEyebrow />
        <HeroHeading />
        <p className="font-display mt-4 text-xl text-rw-gold md:text-2xl">{HERO_TAGLINE}</p>
        <p className="mt-5 text-sm text-white/75 md:text-base">{HERO_SUPPORTING}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <MarketingButton href="#register">Register Now</MarketingButton>
          <MarketingButton href={HERO_SECONDARY_CTA.href} variant="outline">
            {HERO_SECONDARY_CTA.label}
          </MarketingButton>
        </div>
      </div>
    </section>
  );
}
