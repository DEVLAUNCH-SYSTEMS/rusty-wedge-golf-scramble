import { describe, expect, it } from "vitest";

import { parseTournamentLifecycleFormData } from "@/lib/actions/parse-tournament-lifecycle-form";

function lifecycleFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("tournamentId", "tournament-1");
  formData.set("toStatus", "registration_closed");
  formData.set("confirmYear", "");
  formData.set("confirmAcknowledged", "yes");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("parseTournamentLifecycleFormData", () => {
  it("parses valid lifecycle transition input", () => {
    expect(parseTournamentLifecycleFormData(lifecycleFormData())).toEqual({
      tournamentId: "tournament-1",
      toStatus: "registration_closed",
      confirmYear: "",
      confirmAcknowledged: "yes",
    });
  });

  it("rejects missing tournament id", () => {
    expect(() =>
      parseTournamentLifecycleFormData(lifecycleFormData({ tournamentId: "" })),
    ).toThrow(/Tournament is required/);
  });

  it("rejects invalid lifecycle targets", () => {
    expect(() =>
      parseTournamentLifecycleFormData(
        lifecycleFormData({ toStatus: "invalid-status" }),
      ),
    ).toThrow(/valid lifecycle action/);
  });
});
