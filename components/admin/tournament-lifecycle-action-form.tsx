"use client";

import {
  adminButtonClassName,
  adminDangerButtonClassName,
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";

import type { TournamentLifecycleAction } from "@/lib/content/tournament-lifecycle-actions";
import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

type TournamentLifecycleActionFormProps = {
  tournament: AdminTournamentListItem;
  action: TournamentLifecycleAction;
  disabled: boolean;
  onSubmit: (formData: FormData) => void;
};

function ConfirmAcknowledgeField({ label }: { label: string }) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name="confirmAcknowledged"
        value="yes"
        required
        className="mt-1"
      />
      <span>{label}</span>
    </label>
  );
}

function ConfirmYearField({ year }: { year: number }) {
  return (
    <label className={adminLabelClassName}>
      Type {year} to confirm archive
      <input
        name="confirmYear"
        type="text"
        inputMode="numeric"
        required
        autoComplete="off"
        placeholder={String(year)}
        className={adminInputClassName}
      />
    </label>
  );
}

function LifecycleActionFields({
  tournament,
  action,
}: Pick<TournamentLifecycleActionFormProps, "tournament" | "action">) {
  return (
    <>
      <p className={`text-xs ${adminMutedTextClassName}`}>{action.description}</p>
      {action.requiresYearConfirm ? (
        <ConfirmYearField year={tournament.year} />
      ) : null}
      {action.requiresAcknowledge ? (
        <ConfirmAcknowledgeField label={`I understand: ${action.description}`} />
      ) : null}
    </>
  );
}

export function TournamentLifecycleActionForm(props: TournamentLifecycleActionFormProps) {
  const buttonClassName = props.action.danger
    ? adminDangerButtonClassName
    : adminButtonClassName;

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-rw-gray/40 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(new FormData(event.currentTarget));
      }}
    >
      <input type="hidden" name="tournamentId" value={props.tournament.id} />
      <input type="hidden" name="toStatus" value={props.action.toStatus} />
      <LifecycleActionFields tournament={props.tournament} action={props.action} />
      <button type="submit" disabled={props.disabled} className={buttonClassName}>
        {props.action.label}
      </button>
    </form>
  );
}
