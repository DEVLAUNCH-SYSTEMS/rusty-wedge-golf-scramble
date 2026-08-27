import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "../..");

function readSource(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

describe("public site header navigation", () => {
  it("passes the same navLinks model to desktop and responsive menus", () => {
    const headerSource = readSource("components/marketing/site-header.tsx");

    expect(headerSource).toContain("<SiteNav navLinks={navLinks} />");
    expect(headerSource).toContain("<SiteHeaderMobileNav navLinks={navLinks} />");
  });

  it("keeps inline desktop navigation at lg and above", () => {
    const headerSource = readSource("components/marketing/site-header.tsx");

    expect(headerSource).toMatch(/hidden lg:flex/);
  });

  it("shows the responsive menu trigger below lg", () => {
    const mobileNavSource = readSource("components/marketing/site-header-mobile-nav.tsx");
    const triggerSource = readSource("components/marketing/mobile-nav-menu-trigger.tsx");

    expect(mobileNavSource).toContain("lg:hidden");
    expect(triggerSource).toContain('aria-label={open ? "Close navigation" : "Open navigation"}');
    expect(mobileNavSource).toContain("MobileNavMenuPanel");
  });

  it("reuses PublicNavLinkList for both desktop and mobile link rendering", () => {
    const listSource = readSource("components/marketing/public-nav-link-list.tsx");
    const headerSource = readSource("components/marketing/site-header.tsx");
    const panelSource = readSource("components/marketing/mobile-nav-menu-panel.tsx");

    expect(listSource).toContain("navLinks.map");
    expect(headerSource).toContain("PublicNavLinkList");
    expect(panelSource).toContain("PublicNavLinkList");
    expect(headerSource).not.toMatch(/Event Details|Trophy|Experience|Contact/);
    expect(panelSource).not.toMatch(/Event Details|Trophy|Experience|Contact/);
  });

  it("anchors the responsive menu within the viewport on narrow screens", () => {
    const panelSource = readSource("components/marketing/mobile-nav-menu-panel.tsx");

    expect(panelSource).toContain("fixed inset-x-6");
    expect(panelSource).not.toContain("absolute right-0");
  });

  it("closes the responsive menu after link selection", () => {
    const mobileNavSource = readSource("components/marketing/site-header-mobile-nav.tsx");

    expect(mobileNavSource).toContain("onNavigate={closeMenu}");
  });
});
