import { adminInputClassName, adminLabelClassName } from "@/components/admin/admin-form-styles";
import { ScoreRelativeToParInput } from "@/components/admin/score-relative-to-par-input";

export function TeamScoreRelativeField({
  scoreRelativeToPar,
}: {
  scoreRelativeToPar: number | null;
}) {
  return (
    <label htmlFor="team-score-relative-to-par" className={adminLabelClassName}>
      Relative to par
      <ScoreRelativeToParInput
        id="team-score-relative-to-par"
        name="scoreRelativeToPar"
        scoreRelativeToPar={scoreRelativeToPar}
        ariaLabel="Relative to par"
        className={adminInputClassName}
      />
    </label>
  );
}

export function TeamScoreStrokesField({
  scoreTotalStrokes,
}: {
  scoreTotalStrokes: number | null;
}) {
  return (
    <label className={adminLabelClassName}>
      Total strokes
      <input
        type="number"
        name="scoreTotalStrokes"
        min={1}
        step={1}
        defaultValue={scoreTotalStrokes ?? undefined}
        className={adminInputClassName}
      />
    </label>
  );
}
