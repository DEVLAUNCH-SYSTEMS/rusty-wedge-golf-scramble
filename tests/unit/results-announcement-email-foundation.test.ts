import { afterEach, describe, expect, it } from "vitest";

import {
  buildPublicResultsAbsoluteUrl,
  normalizeAppBaseUrl,
} from "@/lib/email/app-base-url";
import { ServiceError } from "@/lib/services/service-error";

describe("normalizeAppBaseUrl", () => {
  it("accepts absolute URLs and strips trailing slashes from the path", () => {
    expect(normalizeAppBaseUrl("https://example.com/")).toBe("https://example.com");
    expect(normalizeAppBaseUrl("https://example.com/app/")).toBe("https://example.com");
  });

  it("adds https when the scheme is omitted", () => {
    expect(normalizeAppBaseUrl("rustywedge.example.com")).toBe(
      "https://rustywedge.example.com",
    );
  });

  it("rejects blank values", () => {
    expect(() => normalizeAppBaseUrl("   ")).toThrow(ServiceError);
  });
});

describe("buildPublicResultsAbsoluteUrl", () => {
  it("builds the public Results page URL from APP_BASE_URL", () => {
    expect(buildPublicResultsAbsoluteUrl("https://example.com")).toBe(
      "https://example.com/teams",
    );
    expect(buildPublicResultsAbsoluteUrl("https://example.com/")).toBe(
      "https://example.com/teams",
    );
  });
});

describe("resend env config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("reports configured when required env vars are present", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "results@send.example.com";
    process.env.APP_BASE_URL = "https://example.com";

    const { isResendConfigured, getResendEnvConfig } = await import(
      "@/lib/email/resend-env"
    );

    expect(isResendConfigured()).toBe(true);
    expect(getResendEnvConfig()).toEqual({
      apiKey: "re_test",
      from: "Rusty Wedge Golf Scramble <results@send.example.com>",
      appBaseUrl: "https://example.com",
    });
  });

  it("normalizes RESEND_FROM to the approved sender display name", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Old Name <results@send.example.com>";
    process.env.APP_BASE_URL = "https://example.com";

    const { getResendEnvConfig } = await import("@/lib/email/resend-env");

    expect(getResendEnvConfig().from).toBe(
      "Rusty Wedge Golf Scramble <results@send.example.com>",
    );
  });

  it("throws when required env vars are missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    delete process.env.APP_BASE_URL;

    const { getResendEnvConfig } = await import("@/lib/email/resend-env");

    expect(() => getResendEnvConfig()).toThrow(ServiceError);
  });
});

describe("buildResultsAnnouncementIdempotencyKey", () => {
  it("derives a stable provider idempotency key per tournament", async () => {
    const { buildResultsAnnouncementIdempotencyKey } = await import(
      "@/lib/email/results-announcement-idempotency"
    );

    expect(
      buildResultsAnnouncementIdempotencyKey(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).toBe("results-announcement:11111111-1111-4111-8111-111111111111");
  });
});

describe("buildResultsAnnouncementEmailContent", () => {
  it("builds branded announcement content", async () => {
    const { buildResultsAnnouncementEmailContent } = await import(
      "@/lib/email/results-announcement-template"
    );

    const content = buildResultsAnnouncementEmailContent({
      tournamentName: "The Rusty Wedge Golf Scramble",
      tournamentYear: 2026,
      recipientFirstName: "Pat",
      resultsUrl: "https://example.com/teams",
    });

    expect(content.subject).toBe(
      "The Rusty Wedge Golf Scramble — Results Are Live",
    );
    expect(content.html).toContain('href="https://example.com/teams"');
    expect(content.html).toContain("View Final Results");
  });
});

describe("getResendClient", () => {
  const originalEnv = { ...process.env };

  afterEach(async () => {
    process.env = { ...originalEnv };
    const { resetResendClientForTests } = await import("@/lib/email/resend-client");
    resetResendClientForTests();
  });

  it("constructs a Resend client when email env is configured", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@example.com>";
    process.env.APP_BASE_URL = "https://example.com";

    const { getResendClient } = await import("@/lib/email/resend-client");

    expect(getResendClient()).toBeDefined();
  });
});
