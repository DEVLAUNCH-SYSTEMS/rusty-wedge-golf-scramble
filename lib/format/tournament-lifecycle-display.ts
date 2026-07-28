import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

const LIFECYCLE_LABELS = {
  draft: "Draft",
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  completed: "Completed",
  archived: "Archived",
} as const satisfies Record<TournamentLifecycleStatus, string>;

export function lifecycleStatusLabel(status: TournamentLifecycleStatus): string {
  return LIFECYCLE_LABELS[status];
}

export function lifecycleStatusTone(
  status: TournamentLifecycleStatus,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "registration_open":
      return "success";
    case "registration_closed":
      return "warning";
    case "completed":
      return "info";
    case "archived":
      return "neutral";
    default:
      return "neutral";
  }
}
