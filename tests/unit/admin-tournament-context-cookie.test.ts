import { describe, expect, it } from "vitest";

import {
  ADMIN_TOURNAMENT_CONTEXT_COOKIE_PATH,
  adminTournamentContextCookieOptions,
} from "@/lib/services/admin-tournament-context.constants";

describe("adminTournamentContextCookieOptions", () => {
  it("scopes the cookie to admin routes so delete and set use the same path", () => {
    expect(adminTournamentContextCookieOptions()).toMatchObject({
      path: ADMIN_TOURNAMENT_CONTEXT_COOKIE_PATH,
      sameSite: "lax",
      httpOnly: true,
    });
  });
});
