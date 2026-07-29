import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentSlugAvailable,
  assertTournamentYearAvailable,
} from "@/lib/services/tournament-create";

const mockLimit = vi.fn();

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockLimit,
        }),
      }),
    }),
  }),
}));

describe("tournament create uniqueness checks", () => {
  beforeEach(() => {
    mockLimit.mockReset();
  });

  it("allows slug when none exists", async () => {
    mockLimit.mockResolvedValue([]);

    await expect(
      assertTournamentSlugAvailable("2027-rusty-wedge"),
    ).resolves.toBeUndefined();
  });

  it("rejects duplicate slug", async () => {
    mockLimit.mockResolvedValue([{ id: "existing-id" }]);

    await expect(
      assertTournamentSlugAvailable("2026-rusty-wedge"),
    ).rejects.toMatchObject({
      code: "DUPLICATE_TOURNAMENT_SLUG",
    } satisfies Partial<ServiceError>);
  });

  it("allows year when none exists", async () => {
    mockLimit.mockResolvedValue([]);

    await expect(assertTournamentYearAvailable(2027)).resolves.toBeUndefined();
  });

  it("rejects duplicate year", async () => {
    mockLimit.mockResolvedValue([{ id: "existing-id" }]);

    await expect(assertTournamentYearAvailable(2026)).rejects.toMatchObject({
      code: "DUPLICATE_TOURNAMENT_YEAR",
    } satisfies Partial<ServiceError>);
  });
});
