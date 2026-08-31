import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import {
  cleanupIntegrationFixtures,
  type TournamentStateSnapshot,
} from "@/lib/services/integration-fixture-cleanup";

export type IntegrationFixtureRegistryState = {
  adminUserIds: string[];
  teamIds: string[];
  registrationIds: string[];
  waitlistEntryIds: string[];
  tournamentIds: string[];
  tournamentSnapshots: Map<string, TournamentStateSnapshot>;
};

const REGISTRY_GLOBAL_KEY = "__integrationFixtureRegistry__";

type RegistryGlobal = typeof globalThis & {
  [REGISTRY_GLOBAL_KEY]?: IntegrationFixtureRegistryState;
};

export function createIntegrationFixtureRegistry(): IntegrationFixtureRegistryState {
  return {
    adminUserIds: [],
    teamIds: [],
    registrationIds: [],
    waitlistEntryIds: [],
    tournamentIds: [],
    tournamentSnapshots: new Map(),
  };
}

function getRegistryGlobal(): RegistryGlobal {
  return globalThis as RegistryGlobal;
}

export function getIntegrationFixtureRegistry(): IntegrationFixtureRegistryState {
  const globalRef = getRegistryGlobal();

  if (!globalRef[REGISTRY_GLOBAL_KEY]) {
    globalRef[REGISTRY_GLOBAL_KEY] = createIntegrationFixtureRegistry();
  }

  return globalRef[REGISTRY_GLOBAL_KEY]!;
}

export const integrationFixtureRegistry = getIntegrationFixtureRegistry();

function pushUnique(values: string[], id: string): void {
  if (!values.includes(id)) {
    values.push(id);
  }
}

export function trackIntegrationAdminUser(
  registry: IntegrationFixtureRegistryState,
  adminUserId: string,
): void {
  pushUnique(registry.adminUserIds, adminUserId);
}

export function trackIntegrationTeam(
  registry: IntegrationFixtureRegistryState,
  teamId: string,
): void {
  pushUnique(registry.teamIds, teamId);
}

export function trackIntegrationRegistration(
  registry: IntegrationFixtureRegistryState,
  registrationId: string,
): void {
  pushUnique(registry.registrationIds, registrationId);
}

export function trackIntegrationWaitlistEntry(
  registry: IntegrationFixtureRegistryState,
  waitlistEntryId: string,
): void {
  pushUnique(registry.waitlistEntryIds, waitlistEntryId);
}

export function trackIntegrationTournament(
  registry: IntegrationFixtureRegistryState,
  tournamentId: string,
): void {
  pushUnique(registry.tournamentIds, tournamentId);
}

export async function snapshotIntegrationTournament(
  registry: IntegrationFixtureRegistryState,
  tournamentId: string,
): Promise<void> {
  if (registry.tournamentSnapshots.has(tournamentId)) {
    return;
  }

  const db = getDb();
  const row = (
    await db
      .select({
        lifecycleStatus: tournaments.lifecycleStatus,
        teamsPublished: tournaments.teamsPublished,
        registrationEnabled: tournaments.registrationEnabled,
        isActive: tournaments.isActive,
      })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error(`Tournament ${tournamentId} not found for snapshot.`);
  }

  registry.tournamentSnapshots.set(tournamentId, {
    lifecycleStatus: row.lifecycleStatus,
    teamsPublished: row.teamsPublished,
    registrationEnabled: row.registrationEnabled,
    isActive: row.isActive,
  });
}

export async function cleanupIntegrationFixtureRegistry(
  registry: IntegrationFixtureRegistryState,
): Promise<void> {
  await cleanupIntegrationFixtures({
    adminUserIds: registry.adminUserIds,
    teamIds: registry.teamIds,
    registrationIds: registry.registrationIds,
    waitlistEntryIds: registry.waitlistEntryIds,
    tournamentIds: registry.tournamentIds,
    tournamentSnapshots: registry.tournamentSnapshots,
  });

  registry.adminUserIds.length = 0;
  registry.teamIds.length = 0;
  registry.registrationIds.length = 0;
  registry.waitlistEntryIds.length = 0;
  registry.tournamentIds.length = 0;
  registry.tournamentSnapshots.clear();
}
