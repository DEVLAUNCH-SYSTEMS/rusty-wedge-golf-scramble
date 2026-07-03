import { eq } from "drizzle-orm";

import { createDb } from "@/lib/db";
import { loadEnvFiles } from "@/lib/db/load-env";
import { tournaments } from "@/lib/db/schema";

loadEnvFiles();

const ACTIVE_TOURNAMENT_SLUG = "2026-rusty-wedge";

const ACTIVE_TOURNAMENT = {
  name: "The Rusty Wedge Golf Scramble",
  slug: ACTIVE_TOURNAMENT_SLUG,
  year: 2026,
  eventDate: "2026-08-28",
  teeTime: "09:00:00",
  locationName: "Deer Park Golf Course",
  entryFeeCents: 8500,
  confirmedCapacityLimit: 68,
  venmoHandle: "@scottyrusty",
  registrationEnabled: true,
  isActive: true,
} as const;

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
      .set(ACTIVE_TOURNAMENT)
      .where(eq(tournaments.slug, ACTIVE_TOURNAMENT_SLUG));
    console.log("Updated active tournament seed:", ACTIVE_TOURNAMENT_SLUG);
    return;
  }

  await db.insert(tournaments).values(ACTIVE_TOURNAMENT);
  console.log("Seeded active tournament:", ACTIVE_TOURNAMENT_SLUG);
}

seedActiveTournament().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
