import { describe, expect, it } from "vitest";

import { toPublicTournamentView } from "@/lib/format/tournament-display";
import {
  isPublicRegistrationOpen,
  type Tournament,
} from "@/lib/services/tournament";

function tournamentWithLifecycle(
  lifecycleStatus: Tournament["lifecycleStatus"],
): Tournament {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test Tournament",
    slug: "test-tournament",
    year: 2026,
    eventDate: "2026-08-28",
    teeTime: "09:00:00",
    locationName: "Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@test",
    registrationEnabled: lifecycleStatus === "registration_open",
    isActive: true,
    lifecycleStatus,
    registrationOpensAt: null,
    registrationClosesAt: null,
    archivedAt: null,
    archivedByAdminId: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("public registration lifecycle gates", () => {
  it("allows public signup only when lifecycle is registration_open", () => {
    expect(
      isPublicRegistrationOpen(
        tournamentWithLifecycle("registration_open"),
      ),
    ).toBe(true);

    for (const lifecycleStatus of [
      "draft",
      "registration_closed",
      "completed",
      "archived",
    ] as const) {
      expect(
        isPublicRegistrationOpen(tournamentWithLifecycle(lifecycleStatus)),
      ).toBe(false);
    }
  });

  it("derives public registrationEnabled from lifecycle, not the DB flag", () => {
    const drifted = tournamentWithLifecycle("registration_closed");
    drifted.registrationEnabled = true;

    expect(toPublicTournamentView(drifted).registrationEnabled).toBe(false);
    expect(toPublicTournamentView(
      tournamentWithLifecycle("registration_open"),
    ).registrationEnabled).toBe(true);
  });
});
