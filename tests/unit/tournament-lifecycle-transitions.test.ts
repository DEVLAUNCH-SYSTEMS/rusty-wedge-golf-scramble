import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import {
  allowedLifecycleTransitions,
  assertLifecycleTransition,
  canTransitionLifecycle,
} from "@/lib/services/tournament-lifecycle-transitions";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

const ALL_STATUSES = [
  "draft",
  "registration_open",
  "registration_closed",
  "completed",
  "archived",
] as const satisfies readonly TournamentLifecycleStatus[];

const ALLOWED_EDGES: readonly (readonly [
  TournamentLifecycleStatus,
  TournamentLifecycleStatus,
])[] = [
  ["draft", "registration_open"],
  ["registration_open", "registration_closed"],
  ["registration_closed", "registration_open"],
  ["registration_closed", "completed"],
  ["completed", "archived"],
  ["archived", "completed"],
];

function isAllowedEdge(
  from: TournamentLifecycleStatus,
  to: TournamentLifecycleStatus,
): boolean {
  return ALLOWED_EDGES.some(([allowedFrom, allowedTo]) => {
    return allowedFrom === from && allowedTo === to;
  });
}

describe("tournament lifecycle transition map", () => {
  it.each(ALLOWED_EDGES)(
    "allows %s → %s",
    (from, to) => {
      expect(canTransitionLifecycle(from, to)).toBe(true);
      expect(allowedLifecycleTransitions(from)).toContain(to);
      expect(() => assertLifecycleTransition(from, to)).not.toThrow();
    },
  );

  it.each(
    ALL_STATUSES.flatMap((from) =>
      ALL_STATUSES.filter((to) => !isAllowedEdge(from, to)).map(
        (to) => [from, to] as const,
      ),
    ),
  )("rejects %s → %s", (from, to) => {
    expect(canTransitionLifecycle(from, to)).toBe(false);
    expect(() => assertLifecycleTransition(from, to)).toThrow(ServiceError);
    expect(() => assertLifecycleTransition(from, to)).toThrow(
      expect.objectContaining({ code: "INVALID_LIFECYCLE_TRANSITION" }),
    );
  });

  it("documents allowed targets per status", () => {
    expect(allowedLifecycleTransitions("draft")).toEqual(["registration_open"]);
    expect(allowedLifecycleTransitions("registration_open")).toEqual([
      "registration_closed",
    ]);
    expect(allowedLifecycleTransitions("registration_closed")).toEqual([
      "registration_open",
      "completed",
    ]);
    expect(allowedLifecycleTransitions("completed")).toEqual(["archived"]);
    expect(allowedLifecycleTransitions("archived")).toEqual(["completed"]);
  });
});
