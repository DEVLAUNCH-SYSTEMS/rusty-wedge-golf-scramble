import { adminInputClassName } from "@/components/admin/admin-form-styles";
import { formatScoreRelativeToParFieldValue } from "@/lib/validation/team-score";

type ScoreRelativeToParInputProps = {
  id?: string;
  name: string;
  scoreRelativeToPar: number | null;
  ariaLabel: string;
  className?: string;
};

export function ScoreRelativeToParInput({
  id,
  name,
  scoreRelativeToPar,
  ariaLabel,
  className = adminInputClassName,
}: ScoreRelativeToParInputProps) {
  return (
    <input
      id={id}
      type="text"
      name={name}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      defaultValue={formatScoreRelativeToParFieldValue(scoreRelativeToPar)}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
