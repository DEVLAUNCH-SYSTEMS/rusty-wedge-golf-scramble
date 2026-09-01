import {
  adminMutedTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { TeamResultsCurrentValues } from "@/components/admin/team-results-current-values";
import {
  FINISHING_PLACEMENT_FORM_HELPER,
  TEAM_RESULTS_SECTION_TITLE,
} from "@/lib/content/finishing-placement-admin-copy";

export function TeamResultsIntro({
  finishingPlacement,
  scoreRelativeToPar,
  scoreTotalStrokes,
}: {
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
}) {
  return (
    <>
      <h2 className={adminSectionTitleClassName}>{TEAM_RESULTS_SECTION_TITLE}</h2>
      <TeamResultsCurrentValues
        finishingPlacement={finishingPlacement}
        scoreRelativeToPar={scoreRelativeToPar}
        scoreTotalStrokes={scoreTotalStrokes}
      />
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {FINISHING_PLACEMENT_FORM_HELPER}
      </p>
    </>
  );
}
