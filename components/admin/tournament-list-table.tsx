import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminEmptyStateClassName,
  adminMutedTextClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import {
  lifecycleStatusLabel,
  lifecycleStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";
import { TournamentLifecycleControls } from "@/components/admin/tournament-lifecycle-controls";
import { formatEventDateShort } from "@/lib/format/tournament-display";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

function TournamentActiveCell({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return <StatusBadge label="Active" tone="success" />;
  }

  return <span className={adminMutedTextClassName}>—</span>;
}

function TournamentListRow({ tournament }: { tournament: AdminTournamentListItem }) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <td className="px-4 py-3 font-medium text-rw-navy">{tournament.year}</td>
      <td className="px-4 py-3 text-rw-navy">{tournament.name}</td>
      <td className="px-4 py-3 text-slate-600">
        {formatEventDateShort(tournament.eventDate)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          label={lifecycleStatusLabel(tournament.lifecycleStatus)}
          tone={lifecycleStatusTone(tournament.lifecycleStatus)}
        />
      </td>
      <td className="px-4 py-3">
        <TournamentActiveCell isActive={tournament.isActive} />
      </td>
      <td className="px-4 py-3 align-top">
        <TournamentLifecycleControls tournament={tournament} />
      </td>
    </tr>
  );
}

function TournamentListTableBody({
  tournaments,
}: {
  tournaments: AdminTournamentListItem[];
}) {
  return (
    <tbody className={`divide-y ${adminTableBorderClassName}`}>
      {tournaments.map((tournament) => (
        <TournamentListRow key={tournament.id} tournament={tournament} />
      ))}
    </tbody>
  );
}

function TournamentListTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr>
        <th className="px-4 py-3 font-medium">Year</th>
        <th className="px-4 py-3 font-medium">Tournament</th>
        <th className="px-4 py-3 font-medium">Event date</th>
        <th className="px-4 py-3 font-medium">Lifecycle</th>
        <th className="px-4 py-3 font-medium">Active</th>
        <th className="px-4 py-3 font-medium">Actions</th>
      </tr>
    </thead>
  );
}

export function TournamentListTable({
  tournaments,
}: {
  tournaments: AdminTournamentListItem[];
}) {
  if (tournaments.length === 0) {
    return (
      <p className={adminEmptyStateClassName}>No tournaments have been created yet.</p>
    );
  }

  return (
    <div className={`overflow-x-auto ${adminCardClassName} p-0`}>
      <table className={`min-w-full divide-y ${adminTableBorderClassName} text-sm`}>
        <TournamentListTableHead />
        <TournamentListTableBody tournaments={tournaments} />
      </table>
    </div>
  );
}
