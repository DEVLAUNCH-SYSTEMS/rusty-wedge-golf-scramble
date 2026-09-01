import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DATABASE_TARGET_ENV,
  DEVELOPMENT_DATABASE_TARGET,
} from "@/lib/db/integration-database-target";
import {
  buildResultsAnnouncementIdempotencyKey,
  buildResultsAnnouncementSmokeTestIdempotencyKey,
} from "@/lib/email/results-announcement-idempotency";
import {
  RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV,
  RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV,
  assertResultsAnnouncementSmokeTestAllowed,
  isResultsAnnouncementSmokeTestEnabled,
  readResultsAnnouncementSmokeIdempotencySuffix,
} from "@/lib/email/results-announcement-smoke-env";
import { sendResultsAnnouncementSmokeTest } from "@/lib/services/results-announcement-smoke-test";

const resolveAdminTournamentContext = vi.fn();
const sendResultsAnnouncementBatch = vi.fn();

vi.mock("@/lib/services/admin-tournament-context", () => ({
  resolveAdminTournamentContext: (...args: unknown[]) =>
    resolveAdminTournamentContext(...args),
}));

vi.mock("@/lib/email/results-announcement-batch", () => ({
  sendResultsAnnouncementBatch: (...args: unknown[]) =>
    sendResultsAnnouncementBatch(...args),
}));

describe("results announcement smoke test idempotency", () => {
  it("uses a separate namespace from the production blast key", () => {
    const tournamentId = "11111111-1111-4111-8111-111111111111";

    expect(buildResultsAnnouncementIdempotencyKey(tournamentId)).toBe(
      `results-announcement:${tournamentId}`,
    );
    expect(buildResultsAnnouncementSmokeTestIdempotencyKey(tournamentId, "run-1")).toBe(
      `results-announcement-smoke:${tournamentId}:run-1`,
    );
  });
});

describe("results announcement smoke env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.CI = undefined;
    process.env[DATABASE_TARGET_ENV] = DEVELOPMENT_DATABASE_TARGET;
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@send.test>";
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env[RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV] = "delivered@resend.dev";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("enables smoke tests only in development with a valid configured recipient", () => {
    expect(isResultsAnnouncementSmokeTestEnabled()).toBe(true);
    assertResultsAnnouncementSmokeTestAllowed();
  });

  it("rejects production database targets", () => {
    process.env[DATABASE_TARGET_ENV] = "production";

    expect(isResultsAnnouncementSmokeTestEnabled()).toBe(false);
    expect(() => assertResultsAnnouncementSmokeTestAllowed()).toThrow(
      `Smoke test sends require ${DATABASE_TARGET_ENV}=${DEVELOPMENT_DATABASE_TARGET}.`,
    );
  });

  it("rejects placeholder smoke recipients", () => {
    process.env[RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV] = "test@example.com";

    expect(isResultsAnnouncementSmokeTestEnabled()).toBe(false);
  });

  it("defaults smoke idempotency suffix to a timestamp string when unset", () => {
    delete process.env[RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV];

    expect(readResultsAnnouncementSmokeIdempotencySuffix()).toMatch(/^\d+$/);
  });

  it("honors an explicit smoke idempotency suffix when set", () => {
    process.env[RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV] = "manual-run-7";

    expect(readResultsAnnouncementSmokeIdempotencySuffix()).toBe("manual-run-7");
  });
});

describe("sendResultsAnnouncementSmokeTest", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.CI = undefined;
    process.env[DATABASE_TARGET_ENV] = DEVELOPMENT_DATABASE_TARGET;
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@send.test>";
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env[RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV] = "delivered@resend.dev";
    process.env[RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV] = "run-42";

    resolveAdminTournamentContext.mockResolvedValue({
      isViewingActiveTournament: true,
      tournament: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Test Tournament",
        year: 2026,
        resultsPublished: true,
      },
    });

    sendResultsAnnouncementBatch.mockResolvedValue({
      kind: "full_success",
      recipientCount: 1,
      successCount: 1,
      providerBatchIds: ["email_smoke"],
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it("sends one email to the configured smoke recipient with a smoke idempotency key", async () => {
    const result = await sendResultsAnnouncementSmokeTest({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });

    expect(result).toEqual({
      kind: "sent",
      message: "Smoke test email sent to the configured test recipient.",
    });
    expect(sendResultsAnnouncementBatch).toHaveBeenCalledWith({
      idempotencyKey:
        "results-announcement-smoke:11111111-1111-4111-8111-111111111111:run-42",
      tournamentName: "Test Tournament",
      tournamentYear: 2026,
      recipients: [
        {
          registrationId: "smoke-test",
          email: "delivered@resend.dev",
          firstName: "Smoke",
          lastName: "Test",
        },
      ],
    });
  });

  it("requires results to be published before smoke testing", async () => {
    resolveAdminTournamentContext.mockResolvedValue({
      isViewingActiveTournament: true,
      tournament: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Test Tournament",
        year: 2026,
        resultsPublished: false,
      },
    });

    await expect(
      sendResultsAnnouncementSmokeTest({
        adminUserId: "admin-1",
        neonAuthUserId: "auth-1",
        email: "admin@example.com",
        displayName: "Admin",
      }),
    ).rejects.toMatchObject({
      message: "Publish results before sending a smoke test announcement email.",
    });

    expect(sendResultsAnnouncementBatch).not.toHaveBeenCalled();
  });
});

describe("classifyPermissiveBatchResponse idempotency conflicts", () => {
  it("maps Resend 409 invalid_idempotent_request to a known failure with smoke-test guidance", async () => {
    const { classifyPermissiveBatchResponse } = await import(
      "@/lib/email/results-announcement-batch-classify"
    );

    const outcome = classifyPermissiveBatchResponse({
      recipientCount: 3,
      response: {
        data: null,
        error: {
          statusCode: 409,
          name: "invalid_idempotent_request",
          message:
            "This idempotency key has been used with this HTTP method and endpoint within the last 24 hours, but the request body was modified and doesn't match the original request.",
        },
      },
    });

    expect(outcome).toEqual({
      kind: "known_failure",
      message:
        "Resend rejected the request because this tournament idempotency key was already used with a different payload. In development, use Send smoke test to retest template or config changes without affecting announcement status.",
    });
  });
});
