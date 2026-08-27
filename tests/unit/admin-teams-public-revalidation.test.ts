import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTeamAction } from "@/lib/actions/admin-teams";
import {
  hideTeamsAction,
  publishTeamsAction,
} from "@/lib/actions/admin-teams-publication";

const requireAdminSession = vi.fn();
const createTeam = vi.fn();
const publishTeams = vi.fn();
const hideTeams = vi.fn();
const revalidatePublicLandingAndTeams = vi.fn();
const revalidatePublicLandingAndTeamsIfPublished = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/services/admin-auth", () => ({
  requireAdminSession: (...args: unknown[]) => requireAdminSession(...args),
}));

vi.mock("@/lib/services/teams", () => ({
  createTeam: (...args: unknown[]) => createTeam(...args),
}));

vi.mock("@/lib/services/teams-publication", () => ({
  publishTeams: (...args: unknown[]) => publishTeams(...args),
  hideTeams: (...args: unknown[]) => hideTeams(...args),
}));

vi.mock("@/lib/actions/revalidate-public-teams-surfaces", () => ({
  revalidatePublicLandingAndTeams: (...args: unknown[]) =>
    revalidatePublicLandingAndTeams(...args),
  revalidatePublicLandingAndTeamsIfPublished: (...args: unknown[]) =>
    revalidatePublicLandingAndTeamsIfPublished(...args),
}));

function confirmedFormData(): FormData {
  const formData = new FormData();
  formData.set("confirmAcknowledged", "yes");
  return formData;
}

describe("public teams revalidation wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    createTeam.mockResolvedValue({
      teamNumber: 7,
      name: "Team #7",
    });
    publishTeams.mockResolvedValue({ teamsPublished: true });
    hideTeams.mockResolvedValue({ teamsPublished: false });
  });

  it("revalidates landing and /teams after publish and hide", async () => {
    await publishTeamsAction(confirmedFormData());
    await hideTeamsAction(confirmedFormData());

    expect(revalidatePublicLandingAndTeams).toHaveBeenCalledTimes(2);
  });

  it("revalidates public surfaces after create only through the published guard", async () => {
    await createTeamAction(new FormData());

    expect(revalidatePublicLandingAndTeamsIfPublished).toHaveBeenCalledOnce();
    expect(revalidatePublicLandingAndTeams).not.toHaveBeenCalled();
  });
});
