"use client";

import { useState } from "react";

import { adminEmptyStateClassName } from "@/components/admin/admin-text-styles";
import { BulkResultsEditForm } from "@/components/admin/bulk-results-edit-form";
import { TeamsListTable } from "@/components/admin/teams-list-table";
import { TeamsTeamActionsSection } from "@/components/admin/teams-team-actions-section";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

type TeamsManagementSectionProps = {
  teams: AdminTeamListItem[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
  placementMutationReason?: string;
};

function TeamsEmptyState() {
  return <p className={adminEmptyStateClassName}>No teams created yet.</p>;
}

function TeamsListContent(props: TeamsManagementSectionProps & { isEditing: boolean; onStopEditing: () => void }) {
  if (props.teams.length === 0) {
    return <TeamsEmptyState />;
  }

  if (props.isEditing) {
    return (
      <BulkResultsEditForm
        teams={props.teams}
        sort={props.sort}
        readOnlyReason={props.readOnlyReason}
        onCancel={props.onStopEditing}
        onSaved={props.onStopEditing}
      />
    );
  }

  return (
    <TeamsListTable
      teams={props.teams}
      sort={props.sort}
      readOnlyReason={props.readOnlyReason}
    />
  );
}

export function TeamsManagementSection(props: TeamsManagementSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <TeamsTeamActionsSection
        readOnlyReason={props.readOnlyReason}
        placementMutationReason={props.placementMutationReason}
        hasTeams={props.teams.length > 0}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
      />
      <TeamsListContent
        {...props}
        isEditing={isEditing}
        onStopEditing={() => setIsEditing(false)}
      />
    </>
  );
}
