import { desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export type AdminTournamentListItem = {
  id: string;
  name: string;
  year: number;
  eventDate: string;
  lifecycleStatus: TournamentLifecycleStatus;
  isActive: boolean;
};

export async function listTournamentsForAdmin(): Promise<AdminTournamentListItem[]> {
  const db = getDb();

  return db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      year: tournaments.year,
      eventDate: tournaments.eventDate,
      lifecycleStatus: tournaments.lifecycleStatus,
      isActive: tournaments.isActive,
    })
    .from(tournaments)
    .orderBy(desc(tournaments.year), desc(tournaments.eventDate));
}
