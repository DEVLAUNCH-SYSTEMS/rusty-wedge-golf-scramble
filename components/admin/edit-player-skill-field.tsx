import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { SKILL_LEVEL_OPTIONS } from "@/lib/content/skill-levels";

export function EditPlayerSkillField({ skillLevel }: { skillLevel: string }) {
  return (
    <label className={adminLabelClassName}>
      Best score ever
      <select
        name="skillLevel"
        required
        defaultValue={skillLevel}
        className={adminInputClassName}
      >
        {!skillLevel ? (
          <option value="" disabled>
            Select best score
          </option>
        ) : null}
        {SKILL_LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
