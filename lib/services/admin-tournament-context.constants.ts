export const ADMIN_TOURNAMENT_CONTEXT_COOKIE = "admin_tournament_id";
export const ADMIN_TOURNAMENT_CONTEXT_COOKIE_PATH = "/admin";

export function adminTournamentContextCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: ADMIN_TOURNAMENT_CONTEXT_COOKIE_PATH,
    secure: process.env.NODE_ENV === "production",
  };
}
