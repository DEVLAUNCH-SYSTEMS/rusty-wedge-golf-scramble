import { cookies } from "next/headers";

import {
  ADMIN_TOURNAMENT_CONTEXT_COOKIE,
  adminTournamentContextCookieOptions,
} from "@/lib/services/admin-tournament-context.constants";

export async function readAdminTournamentContextCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_TOURNAMENT_CONTEXT_COOKIE)?.value?.trim();

  return value || null;
}

export async function writeAdminTournamentContextCookie(
  tournamentId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_TOURNAMENT_CONTEXT_COOKIE,
    tournamentId,
    adminTournamentContextCookieOptions(),
  );
}
