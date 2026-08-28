import { eq } from "drizzle-orm";

import { createDb } from "@/lib/db";
import {
  ACTIVE_TOURNAMENT_SEED,
  ACTIVE_TOURNAMENT_SLUG,
} from "@/lib/db/active-tournament-seed";
import { loadEnvFiles } from "@/lib/db/load-env";
import { tournaments } from "@/lib/db/schema";

loadEnvFiles();

async function seedActiveTournament() {
  const db = createDb();
  const existing = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.slug, ACTIVE_TOURNAMENT_SLUG))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(tournaments)
      .set(ACTIVE_TOURNAMENT_SEED)
      .where(eq(tournaments.slug, ACTIVE_TOURNAMENT_SLUG));
    console.log("Updated active tournament seed:", ACTIVE_TOURNAMENT_SLUG);
    return;
  }

  await db.insert(tournaments).values(ACTIVE_TOURNAMENT_SEED);
  console.log("Seeded active tournament:", ACTIVE_TOURNAMENT_SLUG);
}

seedActiveTournament().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
