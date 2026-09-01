import { describe, expect, it } from "vitest";

import {
  buildResultsAnnouncementEmailLogoUrl,
  RESULTS_ANNOUNCEMENT_PUBLIC_LOGO_ORIGIN,
} from "@/lib/email/results-announcement-email-logo-url";

describe("buildResultsAnnouncementEmailLogoUrl", () => {
  it("uses the public Vercel logo when results links point at localhost", () => {
    expect(buildResultsAnnouncementEmailLogoUrl("http://localhost:3000/teams")).toBe(
      `${RESULTS_ANNOUNCEMENT_PUBLIC_LOGO_ORIGIN}/images/logo-hero.png`,
    );
  });

  it("uses the public Vercel logo when results links point at 127.0.0.1", () => {
    expect(buildResultsAnnouncementEmailLogoUrl("http://127.0.0.1:3000/teams")).toBe(
      `${RESULTS_ANNOUNCEMENT_PUBLIC_LOGO_ORIGIN}/images/logo-hero.png`,
    );
  });

  it("uses the deployed site origin for public HTTPS results links", () => {
    expect(
      buildResultsAnnouncementEmailLogoUrl("https://rustywedge.example.com/teams"),
    ).toBe("https://rustywedge.example.com/images/logo-hero.png");
  });
});
