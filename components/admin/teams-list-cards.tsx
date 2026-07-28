import Link from "next/link";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import { adminLinkClassName } from "@/components/admin/admin-text-styles";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
}

function TeamListCard({ team }: { team: AdminTeamListItem }) {
  return (
    <li className={`${adminCardClassName} list-none`}>
      <Link href={`/admin/teams/${team.id}`} className={adminLinkClassName}>
        {team.name}
      </Link>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AdminMobileListField label="Players">{team.memberCount} / 4</AdminMobileListField>
        <AdminMobileListField label="Created">{formatDate(team.createdAt)}</AdminMobileListField>
      </div>
    </li>
  );
}

export function TeamsListCards({ teams }: { teams: AdminTeamListItem[] }) {
  return (
    <ul className="flex flex-col gap-3 min-[1100px]:hidden">
      {teams.map((team) => (
        <TeamListCard key={team.id} team={team} />
      ))}
    </ul>
  );
}
