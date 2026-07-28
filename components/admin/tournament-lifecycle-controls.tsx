"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { TournamentLifecycleActionForm } from "@/components/admin/tournament-lifecycle-action-form";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { transitionTournamentLifecycleAction } from "@/lib/actions/admin-tournament-lifecycle";
import { buildLifecycleActions } from "@/lib/content/tournament-lifecycle-actions";

import type { TournamentLifecycleAction } from "@/lib/content/tournament-lifecycle-actions";
import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

function LifecycleActionList({
  tournament,
  actions,
  disabled,
  onSubmit,
}: {
  tournament: AdminTournamentListItem;
  actions: TournamentLifecycleAction[];
  disabled: boolean;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <>
      {actions.map((action) => (
        <TournamentLifecycleActionForm
          key={action.toStatus}
          tournament={tournament}
          action={action}
          disabled={disabled}
          onSubmit={onSubmit}
        />
      ))}
    </>
  );
}

export function TournamentLifecycleControls({
  tournament,
}: {
  tournament: AdminTournamentListItem;
}) {
  const actions = buildLifecycleActions(tournament.lifecycleStatus);
  const { message, isPending, runAction } = useAdminActionResult();

  if (actions.length === 0) {
    return <span className={adminMutedTextClassName}>—</span>;
  }

  const submit = (formData: FormData) =>
    runAction(() => transitionTournamentLifecycleAction(formData));

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <LifecycleActionList
        tournament={tournament}
        actions={actions}
        disabled={isPending}
        onSubmit={submit}
      />
      <AdminActionMessage message={message} />
    </div>
  );
}
