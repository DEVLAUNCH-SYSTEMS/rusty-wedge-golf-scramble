import { describe, expect, it } from "vitest";

import {
  resolveTeamsPublicationFormConfig,
  teamsPublicationAcknowledgementCopy,
  teamsPublicationStatusDescription,
  teamsPublicationStatusLabel,
} from "@/lib/content/teams-publication-copy";

describe("teams publication copy", () => {
  it("labels hidden and published states clearly", () => {
    expect(teamsPublicationStatusLabel(false)).toBe("Hidden");
    expect(teamsPublicationStatusLabel(true)).toBe("Published");
    expect(teamsPublicationStatusDescription(false)).toContain("hidden");
    expect(teamsPublicationStatusDescription(true)).toContain("visible");
  });

  it("shows publish controls when teams are hidden", () => {
    expect(resolveTeamsPublicationFormConfig(false)).toEqual({
      submitLabel: "Publish teams",
      pendingLabel: "Publishing…",
      danger: false,
    });
    expect(teamsPublicationAcknowledgementCopy(false)).toContain("publishing teams");
  });

  it("shows hide controls when teams are published", () => {
    expect(resolveTeamsPublicationFormConfig(true)).toEqual({
      submitLabel: "Hide teams",
      pendingLabel: "Hiding…",
      danger: true,
    });
    expect(teamsPublicationAcknowledgementCopy(true)).toContain("hiding teams");
  });
});
