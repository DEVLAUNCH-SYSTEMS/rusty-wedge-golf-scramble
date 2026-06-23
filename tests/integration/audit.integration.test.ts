import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { createTeam } from "@/lib/services/teams-mutations";

import { createTestAdminSession } from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("audit integration", () => {
  it("T26: team creation records an audit event", async () => {
    const admin = await createTestAdminSession();
    const team = await createTeam("Audit Team", admin);
    const db = getDb();

    const events = await db
      .select({ eventType: registrationEvents.eventType })
      .from(registrationEvents)
      .where(eq(registrationEvents.teamId, team.id));

    expect(events.some((event) => event.eventType === AUDIT_EVENT_TYPES.teamCreated)).toBe(
      true,
    );
  });
});
