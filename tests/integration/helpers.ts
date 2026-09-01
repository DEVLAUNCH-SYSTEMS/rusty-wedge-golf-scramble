import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db";
import { adminUsers, registrations, tournaments } from "@/lib/db/schema";
import { createAdminRegistration } from "@/lib/services/registration-admin-create";
import { createTeam } from "@/lib/services/teams-mutations";
import { createAdminWaitlistEntry } from "@/lib/services/waitlist-admin-create";
import { createWaitlistEntry } from "@/lib/services/waitlist-create";

import {
  integrationFixtureRegistry,
  snapshotIntegrationTournament,
  trackIntegrationAdminUser,
  trackIntegrationRegistration,
  trackIntegrationTeam,
  trackIntegrationTournament,
  trackIntegrationWaitlistEntry,
} from "./fixture-registry";

import type { AdminSession } from "@/lib/services/admin-auth";

export {
  integrationFixtureRegistry,
  trackIntegrationRegistration,
  trackIntegrationWaitlistEntry,
} from "./fixture-registry";

const TEST_YEAR_MIN = 2080;
const TEST_YEAR_MAX = 2099;

async function isYearAvailable(year: number): Promise<boolean> {
  const db = getDb();
  const row = (
    await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.year, year))
      .limit(1)
  )[0];

  return !row;
}

export async function reserveUniqueTestYear(): Promise<number> {
  const yearCount = TEST_YEAR_MAX - TEST_YEAR_MIN + 1;
  const start = Math.floor(Math.random() * yearCount);

  for (let offset = 0; offset < yearCount; offset++) {
    const year = TEST_YEAR_MIN + ((start + offset) % yearCount);

    if (await isYearAvailable(year)) {
      return year;
    }
  }

  throw new Error(
    `No unused tournament year available between ${TEST_YEAR_MIN} and ${TEST_YEAR_MAX}.`,
  );
}

export async function reserveUniqueTestYearPair(): Promise<[number, number]> {
  for (let first = TEST_YEAR_MIN; first < TEST_YEAR_MAX; first++) {
    if ((await isYearAvailable(first)) && (await isYearAvailable(first + 1))) {
      return [first, first + 1];
    }
  }

  throw new Error(
    `No consecutive unused tournament years available between ${TEST_YEAR_MIN} and ${TEST_YEAR_MAX}.`,
  );
}

export function uniqueTestEmail(label: string): string {
  return `${label}-${randomUUID()}@example.com`;
}

/** Non-placeholder domain for results announcement integration coverage. */
export function uniqueAnnouncementEligibleTestEmail(label: string): string {
  return `${label}-${randomUUID()}@eligible.integration.test`;
}

export async function getActiveTournamentId(): Promise<string> {
  const db = getDb();
  const row = (
    await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.isActive, true))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Active tournament not found. Run npm run db:seed on the CI branch.");
  }

  return row.id;
}

export async function snapshotActiveTournament(): Promise<string> {
  const tournamentId = await getActiveTournamentId();
  await snapshotIntegrationTournament(integrationFixtureRegistry, tournamentId);
  return tournamentId;
}

export async function withDisposableWritableActiveTournament(
  run: (tournamentId: string) => Promise<void>,
): Promise<void> {
  const db = getDb();
  const seedActiveId = await getActiveTournamentId();
  await snapshotIntegrationTournament(integrationFixtureRegistry, seedActiveId);

  const disposableId = await insertDisposableTournament({
    name: "Integration Writable Tournament",
    slugPrefix: "integration-writable",
    lifecycleStatus: "registration_open",
    registrationEnabled: true,
    isActive: false,
  });

  try {
    await db
      .update(tournaments)
      .set({ isActive: false })
      .where(eq(tournaments.isActive, true));
    await db
      .update(tournaments)
      .set({
        isActive: true,
        lifecycleStatus: "registration_open",
        registrationEnabled: true,
      })
      .where(eq(tournaments.id, disposableId));

    await run(disposableId);
  } finally {
    await db.update(tournaments).set({ isActive: false }).where(eq(tournaments.id, disposableId));
    await db.update(tournaments).set({ isActive: true }).where(eq(tournaments.id, seedActiveId));
  }
}

type DisposableTournamentInput = {
  name: string;
  slugPrefix: string;
  year?: number;
  eventDate?: string;
  locationName?: string;
  venmoHandle?: string;
  registrationEnabled?: boolean;
  isActive?: boolean;
  lifecycleStatus?:
    | "draft"
    | "registration_open"
    | "registration_closed"
    | "completed"
    | "archived";
  teamsPublished?: boolean;
};

export async function insertDisposableTournament(
  input: DisposableTournamentInput,
): Promise<string> {
  const db = getDb();
  const year = input.year ?? (await reserveUniqueTestYear());
  const tournament = (
    await db
      .insert(tournaments)
      .values({
        name: input.name,
        slug: `${input.slugPrefix}-${randomUUID()}`,
        year,
        eventDate: input.eventDate ?? `${year}-06-01`,
        locationName: input.locationName ?? "Integration Test Course",
        venmoHandle: input.venmoHandle ?? "@integrationtest",
        registrationEnabled: input.registrationEnabled ?? false,
        isActive: input.isActive ?? false,
        lifecycleStatus: input.lifecycleStatus ?? "registration_closed",
        teamsPublished: input.teamsPublished ?? false,
      })
      .returning({ id: tournaments.id })
  )[0];

  if (!tournament) {
    throw new Error("Unable to insert disposable integration tournament.");
  }

  trackIntegrationTournament(integrationFixtureRegistry, tournament.id);
  return tournament.id;
}

export async function insertRegistrationRow(input: {
  tournamentId: string;
  email: string;
  registrationStatus: "pending_review" | "confirmed" | "cancelled";
  paymentStatus?: "submitted" | "not_submitted";
}) {
  const db = getDb();

  const row = (
    await db
      .insert(registrations)
      .values({
        tournamentId: input.tournamentId,
        firstName: "Test",
        lastName: "Player",
        email: input.email,
        phone: "5095550100",
        skillLevel: "B",
        registrationStatus: input.registrationStatus,
        paymentStatus: input.paymentStatus ?? "submitted",
        paymentProofPath:
          input.registrationStatus === "pending_review"
            ? `payment-proofs/${input.tournamentId}/${randomUUID()}.png`
            : null,
      })
      .returning({ id: registrations.id })
      .then((rows) => rows[0])
  );

  if (row) {
    trackIntegrationRegistration(integrationFixtureRegistry, row.id);
  }

  return row;
}

export async function createTestAdminSession(): Promise<AdminSession> {
  const db = getDb();
  const neonAuthUserId = `test-admin-${randomUUID()}`;
  const email = uniqueTestEmail("admin");

  const admin = (
    await db
      .insert(adminUsers)
      .values({
        neonAuthUserId,
        email,
        displayName: "Integration Admin",
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        displayName: adminUsers.displayName,
      })
  )[0];

  if (!admin) {
    throw new Error("Unable to create test admin user.");
  }

  trackIntegrationAdminUser(integrationFixtureRegistry, admin.id);

  return {
    neonAuthUserId,
    adminUserId: admin.id,
    email: admin.email,
    displayName: admin.displayName,
  };
}

export async function createIntegrationTeam(admin: AdminSession) {
  const team = await createTeam(admin);
  trackIntegrationTeam(integrationFixtureRegistry, team.id);
  return team;
}

export async function createIntegrationAdminRegistration(
  input: Parameters<typeof createAdminRegistration>[0],
  admin: AdminSession,
) {
  const registration = await createAdminRegistration(input, admin);
  trackIntegrationRegistration(integrationFixtureRegistry, registration.id);
  return registration;
}

export async function createIntegrationAdminWaitlistEntry(
  input: Parameters<typeof createAdminWaitlistEntry>[0],
  admin: AdminSession,
) {
  const entry = await createAdminWaitlistEntry(input, admin);
  trackIntegrationWaitlistEntry(integrationFixtureRegistry, entry.id);
  return entry;
}

export async function createIntegrationWaitlistEntry(
  input: Parameters<typeof createWaitlistEntry>[0],
  tournament: Parameters<typeof createWaitlistEntry>[1],
) {
  const entry = await createWaitlistEntry(input, tournament);
  trackIntegrationWaitlistEntry(integrationFixtureRegistry, entry!.id);
  return entry;
}

export { deleteTournamentWithDependents } from "@/lib/services/integration-fixture-cleanup";
