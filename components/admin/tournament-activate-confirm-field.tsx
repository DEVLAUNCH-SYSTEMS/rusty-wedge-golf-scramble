import { TOURNAMENT_ACTIVATE_ACTION } from "@/lib/content/tournament-activate-action";

export function ActivateConfirmField() {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name="confirmAcknowledged"
        value="yes"
        required
        className="mt-1"
      />
      <span>{TOURNAMENT_ACTIVATE_ACTION.confirmLabel}</span>
    </label>
  );
}
