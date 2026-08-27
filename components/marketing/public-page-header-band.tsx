import { SiteHeader } from "@/components/marketing/site-header";

import type { PublicNavLink } from "@/lib/content/landing-content";

export function PublicPageHeaderBand({
  navLinks,
  registerHref,
  children,
}: {
  navLinks: readonly PublicNavLink[];
  registerHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative bg-rw-navy text-white">
      <SiteHeader navLinks={navLinks} registerHref={registerHref} />
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-28">
        <div className="border-t border-rw-gold/35 pt-8 md:pt-10">{children}</div>
      </div>
    </section>
  );
}
