import Link from "next/link";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminEmptyStateClassName,
  adminLinkClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";

import type { AdminAssignablePlayer } from "@/lib/services/admin-teams-list";

function UnassignedPlayerItem({ player }: { player: AdminAssignablePlayer }) {
  return (
    <li className="text-sm text-rw-navy">
      {player.firstName} {player.lastName}{" "}
      <span className="text-slate-500">({player.skillLevel})</span>{" "}
      <Link href={`/admin/registrations/${player.id}`} className={adminLinkClassName}>
        View registration
      </Link>
    </li>
  );
}

export function UnassignedPlayersPanel({
  players,
}: {
  players: AdminAssignablePlayer[];
}) {
  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Unassigned confirmed players</h2>
      {players.length === 0 ? (
        <p className={`${adminEmptyStateClassName} mt-4 border-0 bg-transparent p-0 text-left`}>
          All confirmed players are assigned to teams.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {players.map((player) => (
            <UnassignedPlayerItem key={player.id} player={player} />
          ))}
        </ul>
      )}
    </section>
  );
}
