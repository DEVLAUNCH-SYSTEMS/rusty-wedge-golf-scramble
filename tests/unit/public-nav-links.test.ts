import { describe, expect, it } from "vitest";

import {
  buildPublicNavLinks,
  buildPublicRegisterHref,
} from "@/lib/content/landing-content";

const BASE_SECTION_LABELS = [
  "Event Details",
  "Trophy",
  "Experience",
  "Contact",
];

describe("buildPublicNavLinks", () => {
  it("hides the Teams link when teams and results are unpublished", () => {
    const links = buildPublicNavLinks({
      teamsPublished: false,
      resultsPublished: false,
    });

    expect(links.map((link) => link.label)).toEqual(BASE_SECTION_LABELS);
    expect(links.some((link) => link.href === "/teams")).toBe(false);
  });

  it("shows the Teams link when teams are published", () => {
    const links = buildPublicNavLinks({
      teamsPublished: true,
      resultsPublished: false,
    });

    expect(links.map((link) => link.label)).toEqual([
      ...BASE_SECTION_LABELS.slice(0, 3),
      "Teams",
      BASE_SECTION_LABELS[3],
    ]);
    expect(links.some((link) => link.href === "/teams")).toBe(true);
  });

  it("shows the Results link when results are published", () => {
    const links = buildPublicNavLinks({
      teamsPublished: false,
      resultsPublished: true,
    });

    expect(links.find((link) => link.href === "/teams")?.label).toBe("Results");
  });

  it("prefers Results over Teams when both are published", () => {
    const links = buildPublicNavLinks({
      teamsPublished: true,
      resultsPublished: true,
    });

    expect(links.find((link) => link.href === "/teams")?.label).toBe("Results");
  });

  it("preserves existing section links and styling targets on the landing page", () => {
    const links = buildPublicNavLinks({
      teamsPublished: false,
      resultsPublished: false,
    });

    expect(links[0]).toEqual({ href: "#about", label: "Event Details" });
    expect(links[1]).toEqual({ href: "#trophy", label: "Trophy" });
    expect(links[2]).toEqual({ href: "#experience", label: "Experience" });
    expect(links[3]).toEqual({ href: "#contact", label: "Contact" });
  });

  it("uses home-prefixed anchors on the /teams page", () => {
    const links = buildPublicNavLinks({
      teamsPublished: true,
      resultsPublished: false,
      anchorBase: "/",
    });

    expect(links[0]?.href).toBe("/#about");
    expect(links.find((link) => link.label === "Teams")?.href).toBe("/teams");
  });
});

describe("buildPublicRegisterHref", () => {
  it("links back to registration on the landing page from /teams", () => {
    expect(buildPublicRegisterHref("/")).toBe("/#register");
  });
});
