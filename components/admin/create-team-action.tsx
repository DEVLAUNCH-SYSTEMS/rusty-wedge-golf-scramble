"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { adminButtonClassName } from "@/components/admin/admin-form-styles";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { createTeamAction } from "@/lib/actions/admin-teams";

type FormMessage = { tone: "success" | "error"; text: string };

function resolveCreateTeamMessage(
  disabled: boolean,
  disabledMessage: string | undefined,
  message: FormMessage | null,
): FormMessage | null {
  if (disabled && disabledMessage) {
    return { tone: "error", text: disabledMessage };
  }

  return message;
}

function CreateTeamSubmitButton({
  isDisabled,
  isPending,
  onSubmit,
}: {
  isDisabled: boolean;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isDisabled) {
          onSubmit();
        }
      }}
    >
      <button type="submit" disabled={isDisabled} className={`${adminButtonClassName} w-full`}>
        {isPending ? "Creating…" : "Create team"}
      </button>
    </form>
  );
}

export function CreateTeamAction({
  disabled = false,
  disabledMessage,
}: {
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const { message, isPending, runAction } = useAdminActionResult();

  return (
    <div className="flex flex-col gap-2">
      <CreateTeamSubmitButton
        isDisabled={disabled || isPending}
        isPending={isPending}
        onSubmit={() => runAction(() => createTeamAction(new FormData()))}
      />
      <AdminActionMessage
        message={resolveCreateTeamMessage(disabled, disabledMessage, message)}
      />
    </div>
  );
}
