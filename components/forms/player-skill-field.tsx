import { formInputClassName } from "@/components/forms/form-field-styles";
import { REGISTRATION_FORM } from "@/lib/content/landing-content";
import { SKILL_LEVEL_OPTIONS } from "@/lib/content/skill-levels";

type PlayerSkillFieldProps = {
  idPrefix: string;
};

function SkillLevelSelect({ idPrefix }: PlayerSkillFieldProps) {
  return (
    <select
      id={`${idPrefix}-skillLevel`}
      name="skillLevel"
      required
      defaultValue=""
      className={formInputClassName}
    >
      <option value="" disabled>
        Select skill level
      </option>
      {SKILL_LEVEL_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function PlayerSkillField({ idPrefix }: PlayerSkillFieldProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <label htmlFor={`${idPrefix}-skillLevel`} className="font-medium text-rw-navy">
        Skill level
      </label>
      <p className="text-xs text-slate-500">{REGISTRATION_FORM.skillHelper}</p>
      <SkillLevelSelect idPrefix={idPrefix} />
    </div>
  );
}
