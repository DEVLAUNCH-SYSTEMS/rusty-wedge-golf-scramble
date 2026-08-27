import { deleteTeamAction } from "@/lib/actions/admin-teams";

import type { ActionResult } from "@/lib/actions/action-result";

export type DeleteTeamFormMessage = { tone: "success" | "error"; text: string };

function toFormMessage(result: ActionResult): DeleteTeamFormMessage {
  return {
    tone: result.ok ? "success" : "error",
    text: result.message,
  };
}

type DeleteTeamSubmitRouter = {
  push: (href: string) => void;
  refresh: () => void;
};

function completeDeleteTeamSuccess(
  redirectOnSuccess: string | undefined,
  router: DeleteTeamSubmitRouter,
): void {
  if (redirectOnSuccess) {
    router.push(redirectOnSuccess);
    return;
  }

  router.refresh();
}

async function runDeleteTeamFormSubmit(
  formData: FormData,
  input: {
    redirectOnSuccess?: string;
    router: DeleteTeamSubmitRouter;
    setMessage: (message: DeleteTeamFormMessage) => void;
    onComplete: () => void;
  },
): Promise<void> {
  try {
    const result = await deleteTeamAction(formData);
    input.setMessage(toFormMessage(result));

    if (result.ok) {
      completeDeleteTeamSuccess(input.redirectOnSuccess, input.router);
    }
  } catch {
    input.setMessage({
      tone: "error",
      text: "Unable to complete that action. Please try again.",
    });
  } finally {
    input.onComplete();
  }
}

export function createDeleteTeamSubmitHandler(input: {
  redirectOnSuccess?: string;
  router: DeleteTeamSubmitRouter;
  setMessage: (message: DeleteTeamFormMessage | null) => void;
  setIsPending: (isPending: boolean) => void;
}) {
  return function submitDelete(formData: FormData, disabled: boolean) {
    if (disabled) {
      return;
    }

    input.setMessage(null);
    input.setIsPending(true);

    void runDeleteTeamFormSubmit(formData, {
      redirectOnSuccess: input.redirectOnSuccess,
      router: input.router,
      setMessage: input.setMessage,
      onComplete: () => input.setIsPending(false),
    });
  };
}

export function resolveDeleteTeamDisplayMessage(
  disabled: boolean,
  disabledMessage: string | undefined,
  message: DeleteTeamFormMessage | null,
): DeleteTeamFormMessage | null {
  if (!disabled) {
    return message;
  }

  return {
    tone: "error",
    text:
      disabledMessage ??
      "This action is unavailable for the current tournament.",
  };
}
