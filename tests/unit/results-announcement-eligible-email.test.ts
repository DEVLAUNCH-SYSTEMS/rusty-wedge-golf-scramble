import { describe, expect, it } from "vitest";

import {
  isPlaceholderEmailAddress,
  isPlaceholderEmailDomain,
  PLACEHOLDER_EMAIL_DOMAINS,
} from "@/lib/domain/placeholder-email-domains";
import { isResultsAnnouncementEligibleEmail } from "@/lib/domain/results-announcement-eligible-email";
import { dedupeResultsAnnouncementRecipients } from "@/lib/services/results-announcement-recipients";

describe("placeholder email domains", () => {
  it("lists the minimum blocked domains", () => {
    expect(PLACEHOLDER_EMAIL_DOMAINS).toEqual([
      "example.com",
      "example.org",
      "example.net",
      "test.com",
    ]);
  });

  it("matches domains case-insensitively", () => {
    expect(isPlaceholderEmailDomain("Example.COM")).toBe(true);
    expect(isPlaceholderEmailAddress("player@EXAMPLE.NET")).toBe(true);
    expect(isPlaceholderEmailDomain("realdomain.com")).toBe(false);
  });
});

describe("isResultsAnnouncementEligibleEmail", () => {
  it("accepts real addresses", () => {
    expect(isResultsAnnouncementEligibleEmail("player@gmail.com")).toBe(true);
    expect(isResultsAnnouncementEligibleEmail("  Player@Gmail.com ")).toBe(true);
  });

  it("rejects known placeholder domains", () => {
    for (const domain of PLACEHOLDER_EMAIL_DOMAINS) {
      expect(isResultsAnnouncementEligibleEmail(`player@${domain}`)).toBe(false);
      expect(isResultsAnnouncementEligibleEmail(`player@${domain.toUpperCase()}`)).toBe(
        false,
      );
    }
  });

  it("rejects syntactically invalid addresses", () => {
    expect(isResultsAnnouncementEligibleEmail("not-an-email")).toBe(false);
    expect(isResultsAnnouncementEligibleEmail("@example.com")).toBe(false);
    expect(isResultsAnnouncementEligibleEmail("")).toBe(false);
  });
});

describe("dedupeResultsAnnouncementRecipients", () => {
  it("keeps the earliest eligible row per normalized email", () => {
    const recipients = dedupeResultsAnnouncementRecipients([
      {
        id: "later-id",
        email: "Pat@Eligible.test",
        firstName: "Later",
        lastName: "Player",
        createdAt: new Date("2026-08-02T10:00:00Z"),
      },
      {
        id: "earlier-id",
        email: "pat@eligible.test",
        firstName: "Pat",
        lastName: "Player",
        createdAt: new Date("2026-08-01T10:00:00Z"),
      },
    ]);

    expect(recipients).toEqual([
      {
        registrationId: "earlier-id",
        email: "pat@eligible.test",
        firstName: "Pat",
        lastName: "Player",
      },
    ]);
  });

  it("returns one recipient per unique eligible email", () => {
    const recipients = dedupeResultsAnnouncementRecipients([
      {
        id: "one",
        email: "amy@eligible.test",
        firstName: "Amy",
        lastName: "One",
        createdAt: new Date("2026-08-01T10:00:00Z"),
      },
      {
        id: "two",
        email: "bo@eligible.test",
        firstName: "Bo",
        lastName: "Two",
        createdAt: new Date("2026-08-02T10:00:00Z"),
      },
    ]);

    expect(recipients).toHaveLength(2);
  });

  it("excludes placeholder domains without deleting rows", () => {
    const recipients = dedupeResultsAnnouncementRecipients([
      {
        id: "real",
        email: "real.player@gmail.com",
        firstName: "Real",
        lastName: "Player",
        createdAt: new Date("2026-08-01T10:00:00Z"),
      },
      {
        id: "placeholder",
        email: "placeholder@example.com",
        firstName: "Place",
        lastName: "Holder",
        createdAt: new Date("2026-08-02T10:00:00Z"),
      },
    ]);

    expect(recipients).toHaveLength(1);
    expect(recipients[0]?.registrationId).toBe("real");
  });

  it("excludes invalid syntax and placeholders together", () => {
    const recipients = dedupeResultsAnnouncementRecipients([
      {
        id: "invalid",
        email: "not-an-email",
        firstName: "Bad",
        lastName: "Syntax",
        createdAt: new Date("2026-08-01T10:00:00Z"),
      },
      {
        id: "test-domain",
        email: "player@test.com",
        firstName: "Test",
        lastName: "Domain",
        createdAt: new Date("2026-08-02T10:00:00Z"),
      },
    ]);

    expect(recipients).toEqual([]);
  });
});
