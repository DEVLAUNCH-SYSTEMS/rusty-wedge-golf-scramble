import { FINISHING_PLACEMENT_UNPLACED_LABEL } from "@/lib/content/finishing-placement-admin-copy";
import { formatFinishingPlacementLabel } from "@/lib/format/finishing-placement-display";

export function TeamListPlacementLabel({
  finishingPlacement,
}: {
  finishingPlacement: number | null;
}) {
  if (finishingPlacement == null) {
    return <span className="text-slate-400">{FINISHING_PLACEMENT_UNPLACED_LABEL}</span>;
  }

  return (
    <span className="text-rw-navy">
      {formatFinishingPlacementLabel(finishingPlacement)}
    </span>
  );
}
