import {
  lifecycleStatusLabel,
  lifecycleStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type AdminViewContextBannerProps = {
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function AdminViewContextBanner({
  lifecycleStatus,
  isViewingActiveTournament,
}: AdminViewContextBannerProps) {
  const message = adminViewReadOnlyReason(
    lifecycleStatus,
    isViewingActiveTournament,
  );

  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      {message}
    </div>
  );
}

type AdminTournamentContextBadgeProps = {
  year: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function AdminTournamentContextBadge({
  year,
  lifecycleStatus,
  isViewingActiveTournament,
}: AdminTournamentContextBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-rw-navy">{year}</span>
      <StatusBadge
        label={lifecycleStatusLabel(lifecycleStatus)}
        tone={lifecycleStatusTone(lifecycleStatus)}
      />
      {isViewingActiveTournament ? (
        <StatusBadge label="Public active" tone="success" />
      ) : (
        <StatusBadge label="View only" tone="warning" />
      )}
    </div>
  );
}
