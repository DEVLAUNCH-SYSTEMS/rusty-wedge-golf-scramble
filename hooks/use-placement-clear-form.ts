import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { clearTeamFinishingPlacementAction } from "@/lib/actions/admin-team-finishing-placement";

export function usePlacementClearForm(teamId: string, disabled: boolean) {
  const { message, isPending, runAction } = useAdminActionResult();

  return {
    message,
    isPending,
    clearPlacement: () => {
      if (!disabled) {
        runAction(() => clearTeamFinishingPlacementAction(teamId));
      }
    },
  };
}
