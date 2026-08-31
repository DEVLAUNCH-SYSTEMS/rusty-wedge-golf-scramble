"use client";

import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { saveBulkTeamFinishingPlacementsAction } from "@/lib/actions/admin-bulk-team-finishing-placement";

export function useBulkResultsEditForm(onSaved: () => void) {
  const { message, isPending, runAction } = useAdminActionResult();

  return {
    message,
    isPending,
    saveResults: (formData: FormData) => {
      runAction(async () => {
        const result = await saveBulkTeamFinishingPlacementsAction(formData);

        if (result.ok) {
          onSaved();
        }

        return result;
      });
    },
  };
}
