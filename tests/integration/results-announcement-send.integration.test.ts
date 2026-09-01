import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import * as batchModule from "@/lib/email/results-announcement-batch";
import { buildResultsAnnouncementIdempotencyKey } from "@/lib/email/results-announcement-idempotency";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { claimResultsAnnouncementSend } from "@/lib/services/results-announcement-claim";
import {
  sendResultsAnnouncement,
  verifyResultsAnnouncementSend,
} from "@/lib/services/results-announcement-send";
import { publishResults } from "@/lib/services/results-publication";
import { ServiceError } from "@/lib/services/service-error";

import {
  createTestAdminSession,
  insertRegistrationRow,
  uniqueAnnouncementEligibleTestEmail,
  uniqueTestEmail,
  withDisposableWritableActiveTournament,
} from "./helpers";

function mockActiveTournamentContext() {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(null);
}

async function readAnnouncementState(tournamentId: string) {
  const db = getDb();
  const row = (
    await db
      .select({
        status: tournaments.resultsAnnouncementStatus,
        sentAt: tournaments.resultsAnnouncementSentAt,
      })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Tournament not found.");
  }

  return row;
}

async function readLatestAnnouncementAuditEvent(tournamentId: string) {
  const db = getDb();
  const rows = await db
    .select({
      eventType: registrationEvents.eventType,
      metadata: registrationEvents.metadata,
    })
    .from(registrationEvents)
    .where(eq(registrationEvents.tournamentId, tournamentId))
    .orderBy(registrationEvents.createdAt);

  return rows.filter((row) =>
    (
      [
        AUDIT_EVENT_TYPES.resultsAnnouncementSent,
        AUDIT_EVENT_TYPES.resultsAnnouncementPartial,
        AUDIT_EVENT_TYPES.resultsAnnouncementFailed,
        AUDIT_EVENT_TYPES.resultsAnnouncementAmbiguous,
      ] as string[]
    ).includes(row.eventType),
  );
}

describe.skipIf(!hasIntegrationDatabase())("results announcement send integration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Rusty Wedge <results@example.com>";
    process.env.APP_BASE_URL = "https://example.com";
    mockActiveTournamentContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("claims not_sent and rejects concurrent claims", async () => {
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("confirmed"),
        registrationStatus: "confirmed",
      });

      await claimResultsAnnouncementSend({
        tournamentId,
        adminUserId: admin.adminUserId,
      });

      const state = await readAnnouncementState(tournamentId);
      expect(state.status).toBe("sending");

      await expect(
        claimResultsAnnouncementSend({
          tournamentId,
          adminUserId: admin.adminUserId,
        }),
      ).rejects.toThrow(ServiceError);
    });
  });

  it("finalizes full success with audit event", async () => {
    const admin = await createTestAdminSession();
    const batchSpy = vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "full_success",
      recipientCount: 1,
      successCount: 1,
      providerBatchIds: ["email_123"],
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-success"),
        registrationStatus: "confirmed",
      });

      const result = await sendResultsAnnouncement(admin);

      expect(result.status).toBe("sent");
      expect(result.recipientCount).toBe(1);
      expect(batchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey: buildResultsAnnouncementIdempotencyKey(tournamentId),
        }),
      );

      const state = await readAnnouncementState(tournamentId);
      expect(state.status).toBe("sent");
      expect(state.sentAt).not.toBeNull();

      const auditEvents = await readLatestAnnouncementAuditEvent(tournamentId);
      expect(auditEvents.at(-1)?.eventType).toBe(
        AUDIT_EVENT_TYPES.resultsAnnouncementSent,
      );
    });
  });

  it("finalizes partial success without returning to not_sent", async () => {
    const admin = await createTestAdminSession();
    vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "partial",
      recipientCount: 2,
      successCount: 1,
      failureCount: 1,
      providerBatchIds: ["email_123"],
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-partial-a"),
        registrationStatus: "confirmed",
      });
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-partial-b"),
        registrationStatus: "confirmed",
      });

      const result = await sendResultsAnnouncement(admin);

      expect(result.status).toBe("partial");
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);

      const state = await readAnnouncementState(tournamentId);
      expect(state.status).toBe("partial");
      expect(state.sentAt).toBeNull();
    });
  });

  it("returns to not_sent on known provider failure", async () => {
    const admin = await createTestAdminSession();
    vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "known_failure",
      message: "Invalid from address",
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-failure"),
        registrationStatus: "confirmed",
      });

      const result = await sendResultsAnnouncement(admin);

      expect(result.status).toBe("not_sent");

      const state = await readAnnouncementState(tournamentId);
      expect(state.status).toBe("not_sent");
    });
  });

  it("finalizes ambiguous outcomes without resetting to not_sent", async () => {
    const admin = await createTestAdminSession();
    vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "ambiguous",
      message: "network timeout",
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-ambiguous"),
        registrationStatus: "confirmed",
      });

      const result = await sendResultsAnnouncement(admin);

      expect(result.status).toBe("ambiguous");

      const state = await readAnnouncementState(tournamentId);
      expect(state.status).toBe("ambiguous");
    });
  });

  it("recovers ambiguous sends with the same idempotency key", async () => {
    const admin = await createTestAdminSession();
    const batchSpy = vi
      .spyOn(batchModule, "sendResultsAnnouncementBatch")
      .mockResolvedValueOnce({
        kind: "ambiguous",
        message: "network timeout",
      })
      .mockResolvedValueOnce({
        kind: "full_success",
        recipientCount: 1,
        successCount: 1,
        providerBatchIds: ["email_recovered"],
      });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-recover"),
        registrationStatus: "confirmed",
      });

      await sendResultsAnnouncement(admin);
      const recovered = await verifyResultsAnnouncementSend(admin);

      expect(recovered.status).toBe("sent");
      expect(batchSpy).toHaveBeenCalledTimes(2);
      expect(batchSpy.mock.calls[0]?.[0].idempotencyKey).toBe(
        batchSpy.mock.calls[1]?.[0].idempotencyKey,
      );
    });
  });

  it("blocks send when results are not published", async () => {
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("confirmed-unpublished"),
        registrationStatus: "confirmed",
      });

      await expect(sendResultsAnnouncement(admin)).rejects.toThrow(ServiceError);
    });
  });

  it("excludes confirmed placeholder-domain registrations", async () => {
    const admin = await createTestAdminSession();
    const batchSpy = vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "full_success",
      recipientCount: 1,
      successCount: 1,
      providerBatchIds: ["email_123"],
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      const eligibleEmail = uniqueAnnouncementEligibleTestEmail("eligible-placeholder-filter");
      await insertRegistrationRow({
        tournamentId,
        email: eligibleEmail,
        registrationStatus: "confirmed",
      });
      await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("placeholder-confirmed"),
        registrationStatus: "confirmed",
      });

      await sendResultsAnnouncement(admin);

      expect(batchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: [expect.objectContaining({ email: eligibleEmail })],
        }),
      );
    });
  });

  it("scopes recipients to confirmed registrations only", async () => {
    const admin = await createTestAdminSession();
    const batchSpy = vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockResolvedValue({
      kind: "full_success",
      recipientCount: 1,
      successCount: 1,
      providerBatchIds: ["email_123"],
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      const confirmedEmail = uniqueAnnouncementEligibleTestEmail("confirmed-only");
      await insertRegistrationRow({
        tournamentId,
        email: confirmedEmail,
        registrationStatus: "confirmed",
      });
      await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("pending-only"),
        registrationStatus: "pending_review",
      });
      await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("cancelled-only"),
        registrationStatus: "cancelled",
      });

      await sendResultsAnnouncement(admin);

      expect(batchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: [expect.objectContaining({ email: confirmedEmail })],
        }),
      );
    });
  });

  it("rejects a concurrent second send after the first claim succeeds", async () => {
    const admin = await createTestAdminSession();
    let releaseBatch: (() => void) | undefined;
    const batchGate = new Promise<void>((resolve) => {
      releaseBatch = resolve;
    });

    vi.spyOn(batchModule, "sendResultsAnnouncementBatch").mockImplementation(async () => {
      await batchGate;
      return {
        kind: "full_success",
        recipientCount: 1,
        successCount: 1,
        providerBatchIds: ["email_123"],
      };
    });

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await publishResults(admin);
      await insertRegistrationRow({
        tournamentId,
        email: uniqueAnnouncementEligibleTestEmail("confirmed-concurrent"),
        registrationStatus: "confirmed",
      });

      const firstSend = sendResultsAnnouncement(admin);
      await new Promise((resolve) => setTimeout(resolve, 25));

      await expect(sendResultsAnnouncement(admin)).rejects.toThrow(ServiceError);

      releaseBatch?.();
      const result = await firstSend;
      expect(result.status).toBe("sent");
      expect(await readAnnouncementState(tournamentId)).toMatchObject({
        status: "sent",
      });
    });
  });
});
