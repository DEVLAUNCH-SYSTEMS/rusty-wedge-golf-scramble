import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { transitionTournamentLifecycle } from "@/lib/services/tournament-lifecycle-transition";

import { getActiveTournamentId } from "./helpers";

async function closeRegistrationOpenTournaments(
  adminUserId: string,
  exceptTournamentId?: string,
): Promise<void> {
  const db = getDb();
  const openRows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.lifecycleStatus, "registration_open"));

  for (const row of openRows) {
    if (exceptTournamentId && row.id === exceptTournamentId) {
      continue;
    }

    await transitionTournamentLifecycle({
      tournamentId: row.id,
      toStatus: "registration_closed",
      adminUserId,
    });
  }
}

export async function ensureSeedRegistrationOpen(
  adminUserId: string,
): Promise<string> {
  const seedId = await getActiveTournamentId();
  const db = getDb();

  await closeRegistrationOpenTournaments(adminUserId);

  const seed = (
    await db
      .select({ lifecycleStatus: tournaments.lifecycleStatus })
      .from(tournaments)
      .where(eq(tournaments.id, seedId))
      .limit(1)
  )[0];

  if (seed?.lifecycleStatus !== "registration_open") {
    await transitionTournamentLifecycle({
      tournamentId: seedId,
      toStatus: "registration_open",
      adminUserId,
    });
  }

  return seedId;
}

export async function withExclusiveRegistrationOpen(
  adminUserId: string,
  run: () => Promise<void>,
): Promise<void> {
  const seedId = await getActiveTournamentId();
  const db = getDb();
  const seed = (
    await db
      .select({ lifecycleStatus: tournaments.lifecycleStatus })
      .from(tournaments)
      .where(eq(tournaments.id, seedId))
      .limit(1)
  )[0];

  const shouldRestoreSeed = seed?.lifecycleStatus === "registration_open";

  await closeRegistrationOpenTournaments(adminUserId);

  try {
    await run();
  } finally {
    if (!shouldRestoreSeed) {
      return;
    }

    await closeRegistrationOpenTournaments(adminUserId);

    const seedAfterRun = (
      await db
        .select({ lifecycleStatus: tournaments.lifecycleStatus })
        .from(tournaments)
        .where(eq(tournaments.id, seedId))
        .limit(1)
    )[0];

    if (seedAfterRun?.lifecycleStatus !== "registration_open") {
      await transitionTournamentLifecycle({
        tournamentId: seedId,
        toStatus: "registration_open",
        adminUserId,
      });
    }
  }
}
