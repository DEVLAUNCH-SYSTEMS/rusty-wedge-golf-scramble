import { afterEach, describe, expect, it, vi } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { getAdminDashboardSummary } from "@/lib/services/admin-dashboard";
import {
  getAdminRegistrationDetail,
  listRegistrationsForAdmin,
} from "@/lib/services/admin-registration-list";
import { resolveAdminTournamentContextForId } from "@/lib/services/admin-tournament-context";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { exportRegistrationsCsv } from "@/lib/services/csv-export";
import { getActiveTournament } from "@/lib/services/tournament";

import {
  createMultiYearIsolationFixture,
  deleteMultiYearIsolationTournament,
} from "./multi-year-isolation-helpers";

const createdTournamentIds: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;
    await deleteMultiYearIsolationTournament(tournamentId);
  }
});

function mockAdminContextTournament(tournamentId: string | null) {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(tournamentId);
}

describe.skipIf(!hasIntegrationDatabase())("multi-year tournament isolation", () => {
  it("keeps the public active tournament while admin views another year", async () => {
    const fixture = await createMultiYearIsolationFixture();
    createdTournamentIds.push(fixture.other.id);

    mockAdminContextTournament(fixture.other.id);

    const [publicActive, adminContext] = await Promise.all([
      getActiveTournament(),
      resolveAdminTournamentContextForId(fixture.other.id),
    ]);

    expect(publicActive?.id).toBe(fixture.active.id);
    expect(adminContext.tournament.id).toBe(fixture.other.id);
    expect(adminContext.isViewingActiveTournament).toBe(false);
  });

  it("scopes admin reads and exports to the selected tournament context", async () => {
    const fixture = await createMultiYearIsolationFixture();
    createdTournamentIds.push(fixture.other.id);
    const listFilters = {
      q: undefined,
      registrationStatus: "all" as const,
      paymentStatus: "all" as const,
      skillLevel: "all" as const,
      assignment: "all" as const,
    };

    mockAdminContextTournament(fixture.other.id);

    const [otherList, otherDashboard, otherDetail, otherCsv] = await Promise.all([
      listRegistrationsForAdmin(listFilters),
      getAdminDashboardSummary(),
      getAdminRegistrationDetail(fixture.otherRegistrationId),
      exportRegistrationsCsv(),
    ]);

    expect(otherList.some((row) => row.email === fixture.otherEmail)).toBe(true);
    expect(otherList.some((row) => row.email === fixture.activeEmail)).toBe(false);
    expect(otherDashboard.tournamentName).toBe(fixture.other.name);
    expect(otherDetail?.email).toBe(fixture.otherEmail);
    expect(otherCsv).toContain(fixture.otherEmail);
    expect(otherCsv).not.toContain(fixture.activeEmail);

    mockAdminContextTournament(fixture.active.id);

    const [activeList, activeDashboard, activeDetail] = await Promise.all([
      listRegistrationsForAdmin(listFilters),
      getAdminDashboardSummary(),
      getAdminRegistrationDetail(fixture.otherRegistrationId),
    ]);

    expect(activeList.some((row) => row.email === fixture.activeEmail)).toBe(true);
    expect(activeList.some((row) => row.email === fixture.otherEmail)).toBe(false);
    expect(activeDashboard.tournamentName).toBe(fixture.active.name);
    expect(activeDetail).toBeNull();
  });
});
