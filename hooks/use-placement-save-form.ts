import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { setTeamFinishingPlacementAction } from "@/lib/actions/admin-team-finishing-placement";

export function usePlacementSaveForm(teamId: string, disabled: boolean) {
  const { message, isPending, runAction } = useAdminActionResult();

  return {
    message,
    isPending,
    savePlacement: (formData: FormData) => {
      if (!disabled) {
        runAction(() => setTeamFinishingPlacementAction(teamId, formData));
      }
    },
  };
}
