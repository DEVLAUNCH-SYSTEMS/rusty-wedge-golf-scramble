"use client";

import { useId } from "react";

import { MobileNavMenuPanel } from "@/components/marketing/mobile-nav-menu-panel";
import { MobileNavMenuTrigger } from "@/components/marketing/mobile-nav-menu-trigger";
import { useMobileNavMenu } from "@/hooks/use-mobile-nav-menu";

import type { PublicNavLink } from "@/lib/content/landing-content";

export function SiteHeaderMobileNav({ navLinks }: { navLinks: readonly PublicNavLink[] }) {
  const panelId = useId();
  const { open, containerRef, triggerRef, closeMenu, toggleMenu } = useMobileNavMenu();

  return (
    <div ref={containerRef} className="relative lg:hidden">
      <MobileNavMenuTrigger
        open={open}
        panelId={panelId}
        triggerRef={triggerRef}
        onToggle={toggleMenu}
      />
      {open ? (
        <MobileNavMenuPanel panelId={panelId} navLinks={navLinks} onNavigate={closeMenu} />
      ) : null}
    </div>
  );
}
