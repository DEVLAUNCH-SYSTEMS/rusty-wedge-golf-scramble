"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { assignPlayerToTeamAction } from "@/lib/actions/admin-teams";

import type { AdminAssignablePlayer } from "@/lib/services/admin-teams-list";

type AssignPlayerFormProps = {
  teamId: string;
  players: AdminAssignablePlayer[];
};

export function AssignPlayerForm({ teamId, players }: AssignPlayerFormProps) {
  if (players.length === 0) {
    return null;
  }

  return (
    <AdminActionForm
      title="Assign player"
      submitLabel="Assign to team"
      pendingLabel="Assigning…"
      onSubmit={(formData) => assignPlayerToTeamAction(teamId, formData)}
    >
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
    </AdminActionForm>
  );
}
