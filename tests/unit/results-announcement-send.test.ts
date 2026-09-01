import { afterEach, describe, expect, it } from "vitest";

import {
  classifyBatchTransportError,
  classifyPermissiveBatchResponse,
} from "@/lib/email/results-announcement-batch-classify";
import {
  assertResultsAnnouncementRecipients,
  assertResultsAnnouncementRecoveryAllowed,
  assertResultsAnnouncementSendAllowed,
} from "@/lib/services/results-announcement-send-guards";
import { throwResultsAnnouncementStatusError } from "@/lib/services/results-announcement-status-messages";
import { ServiceError } from "@/lib/services/service-error";

import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";

function buildContext(
  overrides: Partial<AdminTournamentContext["tournament"]> = {},
): AdminTournamentContext {
  return {
    isViewingActiveTournament: true,
    tournament: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Test Tournament",
      slug: "test-tournament",
      year: 2026,
      eventDate: "2026-06-01",
      teeTime: null,
      locationName: "Test Course",
      entryFeeCents: 8500,
      confirmedCapacityLimit: 68,
      venmoHandle: "@test",
      registrationEnabled: true,
      isActive: true,
      lifecycleStatus: "registration_closed",
      registrationOpensAt: null,
      registrationClosesAt: null,
      archivedAt: null,
      archivedByAdminId: null,
      teamsPublished: true,
      resultsPublished: true,
      resultsAnnouncementStatus: "not_sent",
      resultsAnnouncementSentAt: null,
      resultsAnnouncementSentByAdminId: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      ...overrides,
    },
  };
}

describe("classifyPermissiveBatchResponse", () => {
  it("classifies a full success", () => {
    const outcome = classifyPermissiveBatchResponse({
      recipientCount: 2,
      response: {
        data: {
          data: [{ id: "email_1" }, { id: "email_2" }],
          errors: [],
        },
        error: null,
      },
    });

    expect(outcome).toEqual({
      kind: "full_success",
      recipientCount: 2,
      successCount: 2,
      providerBatchIds: ["email_1", "email_2"],
    });
  });

  it("classifies partial success", () => {
    const outcome = classifyPermissiveBatchResponse({
      recipientCount: 2,
      response: {
        data: {
          data: [{ id: "email_1" }],
          errors: [{ index: 1, message: "Invalid recipient" }],
        },
        error: null,
      },
    });

    expect(outcome).toEqual({
      kind: "partial",
      recipientCount: 2,
      successCount: 1,
      failureCount: 1,
      providerBatchIds: ["email_1"],
    });
  });

  it("classifies known provider failure", () => {
    const outcome = classifyPermissiveBatchResponse({
      recipientCount: 2,
      response: {
        data: null,
        error: {
          message: "Invalid from address",
          statusCode: 422,
          name: "invalid_from_address",
        },
      },
    });

    expect(outcome).toEqual({
      kind: "known_failure",
      message: "Invalid from address",
    });
  });

  it("classifies ambiguous provider failure", () => {
    const outcome = classifyPermissiveBatchResponse({
      recipientCount: 2,
      response: {
        data: null,
        error: {
          message: "Internal server error",
          statusCode: 500,
          name: "internal_server_error",
        },
      },
    });

    expect(outcome).toEqual({
      kind: "ambiguous",
      message: "Internal server error",
    });
  });
});

describe("classifyBatchTransportError", () => {
  it("maps transport failures to ambiguous outcomes", () => {
    expect(
      classifyBatchTransportError(new Error("network timeout")),
    ).toEqual({
      kind: "ambiguous",
      message: "network timeout",
    });
  });
});

describe("results announcement send guards", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("blocks unpublished results", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@example.com>";
    process.env.APP_BASE_URL = "https://example.com";

    expect(() =>
      assertResultsAnnouncementSendAllowed(
        buildContext({ resultsPublished: false }),
      ),
    ).toThrow(ServiceError);
  });

  it("blocks non-active tournament context", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@example.com>";
    process.env.APP_BASE_URL = "https://example.com";

    expect(() =>
      assertResultsAnnouncementSendAllowed({
        ...buildContext(),
        isViewingActiveTournament: false,
      }),
    ).toThrow(ServiceError);
  });

  it("allows recovery only for ambiguous or sending statuses", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@example.com>";
    process.env.APP_BASE_URL = "https://example.com";

    expect(() =>
      assertResultsAnnouncementRecoveryAllowed(buildContext(), "ambiguous"),
    ).not.toThrow();

    expect(() =>
      assertResultsAnnouncementRecoveryAllowed(buildContext(), "sending"),
    ).not.toThrow();

    expect(() =>
      assertResultsAnnouncementRecoveryAllowed(buildContext(), "sent"),
    ).toThrow(ServiceError);
  });

  it("blocks zero-recipient sends", () => {
    expect(() => assertResultsAnnouncementRecipients(0)).toThrow(ServiceError);
  });

  it("maps terminal statuses to actionable errors", () => {
    expect(() => throwResultsAnnouncementStatusError("partial")).toThrow(
      /partially sent/i,
    );
    expect(() => throwResultsAnnouncementStatusError("sending")).toThrow(
      /in progress/i,
    );
  });
});
