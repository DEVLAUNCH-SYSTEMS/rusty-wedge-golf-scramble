import {
  assertWaitlistEmailAvailable,
  insertWaitlistRecord,
} from "@/lib/services/player-create-shared";
import {
  assertTournamentWritable,
  requireActiveTournament,
} from "@/lib/services/tournament";
import {
  normalizePlayerEmail,
  playerProfileSchema,
} from "@/lib/validation/player-profile";

import type { AdminSession } from "@/lib/services/admin-auth";
import type { PlayerProfileInput } from "@/lib/validation/player-profile";

export type CreateAdminWaitlistInput = PlayerProfileInput;

export async function createAdminWaitlistEntry(
  input: CreateAdminWaitlistInput,
  admin: AdminSession,
): Promise<{ id: string }> {
  const tournament = await requireActiveTournament();
  assertTournamentWritable(tournament);

  const profile = playerProfileSchema.parse(input);
  const email = normalizePlayerEmail(profile.email);

  await assertWaitlistEmailAvailable(tournament.id, email);

  return insertWaitlistRecord({
    tournamentId: tournament.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email,
    phone: profile.phone,
    skillLevel: profile.skillLevel,
    preferredPlayers: profile.preferredPlayers,
    notes: profile.notes,
    createdSource: "admin",
    createdByAdminId: admin.adminUserId,
  });
}
