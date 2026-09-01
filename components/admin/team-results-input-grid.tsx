import { PlacementInputField } from "@/components/admin/placement-input-field";
import {
  TeamScoreRelativeField,
  TeamScoreStrokesField,
} from "@/components/admin/team-score-input-fields";

export function TeamResultsInputGrid({
  finishingPlacement,
  scoreRelativeToPar,
  scoreTotalStrokes,
}: {
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlacementInputField finishingPlacement={finishingPlacement} required={false} />
      <TeamScoreRelativeField scoreRelativeToPar={scoreRelativeToPar} />
      <TeamScoreStrokesField scoreTotalStrokes={scoreTotalStrokes} />
    </div>
  );
}
