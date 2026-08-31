import {
  adminMutedTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import {
  FINISHING_PLACEMENT_FORM_HELPER,
  finishingPlacementCurrentLabel,
} from "@/lib/content/finishing-placement-admin-copy";
import { formatFinishingPlacementLabel } from "@/lib/format/finishing-placement-display";

export function FinishingPlacementIntro({
  finishingPlacement,
}: {
  finishingPlacement: number | null;
}) {
  return (
    <>
      <h2 className={adminSectionTitleClassName}>Finishing placement</h2>
      <p className="text-sm text-slate-700">
        <span className="font-medium text-rw-navy">Current: </span>
        {finishingPlacementCurrentLabel(finishingPlacement, formatFinishingPlacementLabel)}
      </p>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {FINISHING_PLACEMENT_FORM_HELPER}
      </p>
    </>
  );
}
