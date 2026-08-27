"use client";

import { useState } from "react";

import {
  adminCompactDangerButtonClassName,
  adminSecondaryButtonClassName,
} from "@/components/admin/admin-form-styles";
import { DeleteTeamForm } from "@/components/admin/delete-team-form";
import { formatAdminTeamLabel } from "@/lib/format/team-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

type TeamListTableDeleteProps = {
  team: AdminTeamListItem;
  readOnlyReason?: string;
};

function toDeleteTeamFormProps(team: AdminTeamListItem, readOnlyReason?: string) {
  return {
    teamId: team.id,
    teamLabel: formatAdminTeamLabel(team),
    memberCount: team.memberCount,
    disabled: Boolean(readOnlyReason),
    disabledMessage: readOnlyReason,
  };
}

function DeleteTableTriggerButton({
  disabled,
  readOnlyReason,
  onActivate,
}: {
  disabled: boolean;
  readOnlyReason?: string;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      className={adminCompactDangerButtonClassName}
      disabled={disabled}
      title={readOnlyReason}
      onClick={onActivate}
    >
      Delete
    </button>
  );
}

function DeleteTableConfirmPanel({
  team,
  readOnlyReason,
  onCancel,
}: TeamListTableDeleteProps & { onCancel: () => void }) {
  return (
    <div className="flex min-w-[16rem] flex-col gap-2">
      <DeleteTeamForm compact dense {...toDeleteTeamFormProps(team, readOnlyReason)} />
      <button type="button" className={adminSecondaryButtonClassName} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export function TeamListTableDeleteAction({ team, readOnlyReason }: TeamListTableDeleteProps) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <DeleteTableConfirmPanel
        team={team}
        readOnlyReason={readOnlyReason}
        onCancel={() => setExpanded(false)}
      />
    );
  }

  return (
    <DeleteTableTriggerButton
      disabled={Boolean(readOnlyReason)}
      readOnlyReason={readOnlyReason}
      onActivate={() => setExpanded(true)}
    />
  );
}
