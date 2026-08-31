"use client";

import {
  BulkResultsEditActions,
} from "@/components/admin/bulk-results-edit-actions";
import { TeamsListTable } from "@/components/admin/teams-list-table";
import { useBulkResultsEditForm } from "@/hooks/use-bulk-results-edit-form";
import { BULK_RESULTS_EDIT_HELPER } from "@/lib/content/finishing-placement-admin-copy";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

type BulkResultsEditFormProps = {
  teams: AdminTeamListItem[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
  onCancel: () => void;
  onSaved: () => void;
};

export function BulkResultsEditForm(props: BulkResultsEditFormProps) {
  const form = useBulkResultsEditForm(props.onSaved);

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        form.saveResults(new FormData(event.currentTarget));
      }}
    >
      <p className="text-sm text-slate-600">{BULK_RESULTS_EDIT_HELPER}</p>
      <TeamsListTable
        teams={props.teams}
        sort={props.sort}
        readOnlyReason={props.readOnlyReason}
        bulkEditMode
      />
      <BulkResultsEditActions
        isPending={form.isPending}
        message={form.message}
        onCancel={props.onCancel}
      />
    </form>
  );
}
