"use client";

import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { setTeamResultsAction } from "@/lib/actions/admin-team-results";

export function useTeamResultsSaveForm(teamId: string, disabled: boolean) {
  const { message, isPending, runAction } = useAdminActionResult();

  return {
    message,
    isPending,
    saveResults: (formData: FormData) => {
      if (!disabled) {
        runAction(() => setTeamResultsAction(teamId, formData));
      }
    },
  };
}
