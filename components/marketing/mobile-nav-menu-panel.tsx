import { PublicNavLinkList } from "@/components/marketing/public-nav-link-list";

import type { PublicNavLink } from "@/lib/content/landing-content";

export function MobileNavMenuPanel({
  panelId,
  navLinks,
  onNavigate,
}: {
  panelId: string;
  navLinks: readonly PublicNavLink[];
  onNavigate: () => void;
}) {
  return (
    <nav
      id={panelId}
      aria-label="Primary"
      className="fixed inset-x-6 top-[5.25rem] z-30 rounded-lg border border-white/15 bg-rw-navy py-2 shadow-lg lg:hidden"
    >
      <PublicNavLinkList
        navLinks={navLinks}
        className="flex flex-col text-sm text-white/90"
        linkClassName="block px-4 py-3 hover:bg-white/10 hover:text-rw-gold focus-visible:bg-white/10 focus-visible:text-rw-gold focus-visible:outline-none"
        onNavigate={onNavigate}
      />
    </nav>
  );
}
