import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminMutedTextClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import {
  lifecycleStatusLabel,
  lifecycleStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";
import { TournamentListActionsCell } from "@/components/admin/tournament-list-actions-cell";
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
    <tr className="align-top hover:bg-rw-gray/60">
      <td className="whitespace-nowrap px-4 py-3 font-medium text-rw-navy">
        {tournament.year}
      </td>
      <td className="min-w-[12rem] px-4 py-3 text-rw-navy">{tournament.name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
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
      <td className="min-w-[18rem] px-4 py-3">
        <TournamentListActionsCell tournament={tournament} />
      </td>
    </tr>
  );
}

function TournamentTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr className="align-top">
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

export function TournamentDesktopTable({
  tournaments,
}: {
  tournaments: AdminTournamentListItem[];
}) {
  return (
    <AdminTableScrollShell className="hidden min-[1100px]:block">
      <table className={`min-w-[64rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <TournamentTableHead />
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {tournaments.map((tournament) => (
            <TournamentListRow key={tournament.id} tournament={tournament} />
          ))}
        </tbody>
      </table>
    </AdminTableScrollShell>
  );
}
