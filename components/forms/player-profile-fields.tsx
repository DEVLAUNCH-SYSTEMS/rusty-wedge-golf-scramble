"use client";

import { PlayerContactFields } from "@/components/forms/player-contact-fields";
import { PlayerNameFields } from "@/components/forms/player-name-fields";
import { PlayerOptionalFields } from "@/components/forms/player-optional-fields";
import { PlayerSkillField } from "@/components/forms/player-skill-field";

type PlayerProfileFieldsProps = {
  idPrefix: string;
  showOptionalFields?: boolean;
};

export function PlayerProfileFields({
  idPrefix,
  showOptionalFields = true,
}: PlayerProfileFieldsProps) {
  return (
    <>
      <PlayerNameFields idPrefix={idPrefix} />
      <PlayerContactFields idPrefix={idPrefix} />
      <PlayerSkillField idPrefix={idPrefix} />
      {showOptionalFields ? (
        <PlayerOptionalFields idPrefix={idPrefix} />
      ) : null}
    </>
  );
}
