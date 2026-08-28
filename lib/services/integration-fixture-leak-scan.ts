import { and, gte, lte, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  formatIntegrationFixtureLeakReport,
  integrationTestEmailPattern,
  INTEGRATION_ADMIN_NEON_AUTH_PREFIX,
  INTEGRATION_TEST_TOURNAMENT_YEAR_MAX,
  INTEGRATION_TEST_TOURNAMENT_YEAR_MIN,
  summarizeIntegrationFixtureLeaks,
  type IntegrationFixtureLeakReport,
} from "@/lib/db/integration-fixture-leak";
import {
  adminUsers,
  registrations,
  teams,
  tournaments,
  waitlistEntries,
} from "@/lib/db/schema";

export async function scanIntegrationFixtureLeaks(): Promise<IntegrationFixtureLeakReport> {
  const db = getDb();

  const [teamRows, adminRows, registrationRows, waitlistRows, tournamentRows] =
    await Promise.all([
      db.select({ id: teams.id, name: teams.name }).from(teams),
      db
        .select({
          id: adminUsers.id,
          email: adminUsers.email,
          neonAuthUserId: adminUsers.neonAuthUserId,
        })
        .from(adminUsers)
        .where(sql`${adminUsers.neonAuthUserId} LIKE ${`${INTEGRATION_ADMIN_NEON_AUTH_PREFIX}%`}`),
      db
        .select({ id: registrations.id, email: registrations.email })
        .from(registrations)
        .where(sql`${registrations.email} LIKE ${integrationTestEmailPattern()}`),
      db
        .select({ id: waitlistEntries.id, email: waitlistEntries.email })
        .from(waitlistEntries)
        .where(sql`${waitlistEntries.email} LIKE ${integrationTestEmailPattern()}`),
      db
        .select({
          id: tournaments.id,
          slug: tournaments.slug,
          year: tournaments.year,
        })
        .from(tournaments)
        .where(
          and(
            gte(tournaments.year, INTEGRATION_TEST_TOURNAMENT_YEAR_MIN),
            lte(tournaments.year, INTEGRATION_TEST_TOURNAMENT_YEAR_MAX),
          ),
        ),
    ]);

  return summarizeIntegrationFixtureLeaks({
    teams: teamRows,
    adminUsers: adminRows,
    registrations: registrationRows,
    waitlistEntries: waitlistRows,
    tournaments: tournamentRows,
  });
}

export async function assertNoIntegrationFixtureLeaks(): Promise<void> {
  const report = await scanIntegrationFixtureLeaks();

  if (report.hasLeaks) {
    throw new Error(formatIntegrationFixtureLeakReport(report));
  }
}
