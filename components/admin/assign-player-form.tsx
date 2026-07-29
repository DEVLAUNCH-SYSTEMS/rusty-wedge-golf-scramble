"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { assignPlayerToTeamAction } from "@/lib/actions/admin-teams";

import type { AdminAssignablePlayer } from "@/lib/services/admin-teams-list";

function PlayerSelectField({ players }: { players: AdminAssignablePlayer[] }) {
  return (
    <label className={adminLabelClassName}>
      Confirmed player
      <select name="registrationId" required className={adminInputClassName}>
        <option value="">Select a player</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.lastName}, {player.firstName} ({player.skillLevel})
          </option>
        ))}
      </select>
    </label>
  );
}

export function AssignPlayerForm(props: {
  teamId: string;
  players: AdminAssignablePlayer[];
  disabled?: boolean;
  disabledMessage?: string;
}) {
  if (props.players.length === 0) {
    return null;
  }

  return (
    <AdminActionForm
      title="Assign player"
      submitLabel="Assign to team"
      pendingLabel="Assigning…"
      disabled={props.disabled}
      disabledMessage={props.disabledMessage}
      onSubmit={(formData) => assignPlayerToTeamAction(props.teamId, formData)}
    >
      <PlayerSelectField players={props.players} />
    </AdminActionForm>
  );
}
