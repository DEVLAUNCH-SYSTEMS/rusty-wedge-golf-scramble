"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { adminButtonClassName } from "@/components/admin/admin-form-styles";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { ActivateConfirmField } from "@/components/admin/tournament-activate-confirm-field";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { activateTournamentAction } from "@/lib/actions/admin-tournament-activate";
import { TOURNAMENT_ACTIVATE_ACTION } from "@/lib/content/tournament-activate-action";
import { isLifecycleArchived } from "@/lib/services/tournament-lifecycle";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

type ActivateFormProps = {
  tournamentId: string;
  disabled: boolean;
  onSubmit: (formData: FormData) => void;
};

function ActivateTournamentForm(props: ActivateFormProps) {
  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-rw-gray/40 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(new FormData(event.currentTarget));
      }}
    >
      <input type="hidden" name="tournamentId" value={props.tournamentId} />
      <p className={`text-xs ${adminMutedTextClassName}`}>
        {TOURNAMENT_ACTIVATE_ACTION.description}
      </p>
      <ActivateConfirmField />
      <button
        type="submit"
        disabled={props.disabled}
        className={adminButtonClassName}
      >
        {TOURNAMENT_ACTIVATE_ACTION.label}
      </button>
    </form>
  );
}

export function TournamentActivateControl({
  tournament,
}: {
  tournament: AdminTournamentListItem;
}) {
  const { message, isPending, runAction } = useAdminActionResult();

  if (tournament.isActive || isLifecycleArchived(tournament.lifecycleStatus)) {
    return null;
  }

  return (
    <>
      <ActivateTournamentForm
        tournamentId={tournament.id}
        disabled={isPending}
        onSubmit={(formData) => {
          runAction(() => activateTournamentAction(formData));
        }}
      />
      <AdminActionMessage message={message} />
    </>
  );
}
