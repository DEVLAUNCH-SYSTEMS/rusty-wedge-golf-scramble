"use client";

import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { CreateTournamentCopyField } from "@/components/admin/create-tournament-copy-field";
import { CreateTournamentFields } from "@/components/admin/create-tournament-fields";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

type CopySource = { id: string; label: string };
type FormMessage = { tone: "success" | "error"; text: string };

type CreateTournamentFormBodyProps = {
  defaults: TournamentCreateFormValues;
  copySources: CopySource[];
  selectedCopyFromId: string | null;
  isPending: boolean;
  message: FormMessage | null;
  onNavigate: (path: string) => void;
  onSubmit: (formData: FormData) => void;
};

export function CreateTournamentFormBody(props: CreateTournamentFormBodyProps) {
  return (
    <AdminActionFormBody
      disabled={props.isPending}
      danger={false}
      isPending={props.isPending}
      submitLabel="Create draft tournament"
      pendingLabel="Creating…"
      displayMessage={props.message}
      onSubmit={props.onSubmit}
    >
      <CreateTournamentCopyField
        copySources={props.copySources}
        selectedCopyFromId={props.selectedCopyFromId}
        onNavigate={props.onNavigate}
      />
      <CreateTournamentFields defaults={props.defaults} />
    </AdminActionFormBody>
  );
}
