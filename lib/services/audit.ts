import { getDb } from "@/lib/db";
import { registrationEvents } from "@/lib/db/schema";

import type { RecordAuditEventInput } from "@/lib/services/audit-types";

export { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
export type { AuditEventType, RecordAuditEventInput } from "@/lib/services/audit-types";

export async function recordAuditEvent(
  input: RecordAuditEventInput,
): Promise<void> {
  const db = getDb();

  await db.insert(registrationEvents).values({
    tournamentId: input.tournamentId,
    registrationId: input.registrationId,
    waitlistEntryId: input.waitlistEntryId,
    teamId: input.teamId,
    eventType: input.eventType,
    adminUserId: input.adminUserId,
    metadata: input.metadata,
  });
}
