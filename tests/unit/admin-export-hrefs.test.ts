import { describe, expect, it } from "vitest";

import { buildAdminExportHrefs } from "@/lib/services/admin-export-hrefs";

const activeTournament = {
  id: "active-1",
  name: "Active",
  year: 2026,
  lifecycleStatus: "registration_open" as const,
  isActive: true,
};

const archivedTournament = {
  id: "archived-1",
  name: "Archived",
  year: 2025,
  lifecycleStatus: "archived" as const,
  isActive: false,
};

describe("buildAdminExportHrefs", () => {
  it("omits tournamentId when viewing the public active tournament", () => {
    expect(
      buildAdminExportHrefs({
        tournament: activeTournament,
        isViewingActiveTournament: true,
      }),
    ).toEqual({
      registrations: "/api/admin/export/registrations",
      teams: "/api/admin/export/teams",
    });
  });

  it("includes tournamentId when viewing a non-active tournament", () => {
    expect(
      buildAdminExportHrefs({
        tournament: archivedTournament,
        isViewingActiveTournament: false,
      }),
    ).toEqual({
      registrations: "/api/admin/export/registrations?tournamentId=archived-1",
      teams: "/api/admin/export/teams?tournamentId=archived-1",
    });
  });
});
