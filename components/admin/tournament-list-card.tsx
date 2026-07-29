import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import {
  lifecycleStatusLabel,
  lifecycleStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";
import { TournamentListActionsCell } from "@/components/admin/tournament-list-actions-cell";
import { formatEventDateShort } from "@/lib/format/tournament-display";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

function TournamentActiveBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return <StatusBadge label="Active" tone="success" />;
  }

  return <span className={adminMutedTextClassName}>Not active</span>;
}

function TournamentListCardFields({ tournament }: { tournament: AdminTournamentListItem }) {
  return (
    <div className="mt-4 grid gap-3">
      <AdminMobileListField label="Event date">
        {formatEventDateShort(tournament.eventDate)}
      </AdminMobileListField>
      <AdminMobileListField label="Lifecycle">
        <StatusBadge
          label={lifecycleStatusLabel(tournament.lifecycleStatus)}
          tone={lifecycleStatusTone(tournament.lifecycleStatus)}
        />
      </AdminMobileListField>
      <AdminMobileListField label="Public site">
        <TournamentActiveBadge isActive={tournament.isActive} />
      </AdminMobileListField>
    </div>
  );
}

export function TournamentListCard({ tournament }: { tournament: AdminTournamentListItem }) {
  return (
    <li className="list-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-display text-xl font-semibold text-rw-navy">{tournament.year}</p>
      <p className="mt-1 text-sm font-medium text-rw-navy">{tournament.name}</p>
      <TournamentListCardFields tournament={tournament} />
      <div className="mt-4 border-t border-slate-200 pt-4">
        <TournamentListActionsCell tournament={tournament} />
      </div>
    </li>
  );
}
