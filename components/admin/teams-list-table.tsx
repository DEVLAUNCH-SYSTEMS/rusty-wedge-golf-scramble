import Link from "next/link";

import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminLinkClassName,
  adminMutedTextClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { TeamsListCards } from "@/components/admin/teams-list-cards";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
}

function TeamListRow({ team }: { team: AdminTeamListItem }) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <td className="px-4 py-3">
        <Link href={`/admin/teams/${team.id}`} className={adminLinkClassName}>
          {team.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-rw-navy">{team.memberCount} / 4</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(team.createdAt)}</td>
    </tr>
  );
}

function TeamsDesktopTable({ teams }: { teams: AdminTeamListItem[] }) {
  return (
    <AdminTableScrollShell className="hidden min-[1100px]:block">
      <table className={`min-w-[32rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <thead className={adminTableHeadClassName}>
          <tr>
            <th className="px-4 py-3 font-medium">Team</th>
            <th className="px-4 py-3 font-medium">Players</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {teams.map((team) => (
            <TeamListRow key={team.id} team={team} />
          ))}
        </tbody>
      </table>
      <p className={`${adminMutedTextClassName} px-4 py-3`}>
        Select a team to assign or remove confirmed players.
      </p>
    </AdminTableScrollShell>
  );
}

export function TeamsListTable({ teams }: { teams: AdminTeamListItem[] }) {
  return (
    <>
      <TeamsListCards teams={teams} />
      <p className={`${adminMutedTextClassName} pb-2 min-[1100px]:hidden`}>
        Select a team to assign or remove confirmed players.
      </p>
      <TeamsDesktopTable teams={teams} />
    </>
  );
}
