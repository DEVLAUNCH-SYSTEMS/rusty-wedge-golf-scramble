export const SKILL_LEVEL_OPTIONS = [
  { value: "A", label: "A — Ever broken 80?" },
  { value: "B", label: "B — Ever broken 90?" },
  { value: "C", label: "C — Ever broken 100?" },
  { value: "D", label: "D — Never broken 100?" },
] as const;

export function getSkillLevelLabel(value: string): string {
  return (
    SKILL_LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
