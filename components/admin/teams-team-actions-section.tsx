"use client";

import { AdminSubsectionHeading } from "@/components/admin/admin-subsection-heading";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { CreateTeamAction } from "@/components/admin/create-team-action";
import { EditResultsAction } from "@/components/admin/edit-results-action";

function PlacementMutationNotice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-slate-600">{message}</p>;
}

function TeamActionButtons({
  readOnlyReason,
  editResultsDisabled,
  onStartEdit,
}: {
  readOnlyReason?: string;
  editResultsDisabled: boolean;
  onStartEdit: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-2xl">
      <CreateTeamAction
        disabled={Boolean(readOnlyReason)}
        disabledMessage={readOnlyReason}
      />
      <EditResultsAction disabled={editResultsDisabled} onStartEdit={onStartEdit} />
    </div>
  );
}

type TeamsTeamActionsSectionProps = {
  readOnlyReason?: string;
  placementMutationReason?: string;
  hasTeams: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
};

export function TeamsTeamActionsSection(props: TeamsTeamActionsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <AdminSubsectionHeading>Team actions</AdminSubsectionHeading>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        The next team number is assigned automatically when you create a team.
      </p>
      <TeamActionButtons
        readOnlyReason={props.readOnlyReason}
        editResultsDisabled={
          props.isEditing || !props.hasTeams || Boolean(props.placementMutationReason)
        }
        onStartEdit={props.onStartEdit}
      />
      <PlacementMutationNotice message={props.placementMutationReason} />
    </section>
  );
}
