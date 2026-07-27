import { EditPlayerContactFields } from "@/components/admin/edit-player-contact-fields";
import { EditPlayerNameFields } from "@/components/admin/edit-player-name-fields";
import { EditPlayerOptionalFields } from "@/components/admin/edit-player-optional-fields";
import { EditPlayerSkillField } from "@/components/admin/edit-player-skill-field";

type EditPlayerProfileFieldsProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skillLevel: string;
  preferredPlayers: string | null;
  notes: string | null;
};

export function EditPlayerProfileFields(props: EditPlayerProfileFieldsProps) {
  return (
    <>
      <EditPlayerNameFields
        firstName={props.firstName}
        lastName={props.lastName}
      />
      <EditPlayerContactFields email={props.email} phone={props.phone} />
      <EditPlayerSkillField skillLevel={props.skillLevel} />
      <EditPlayerOptionalFields
        preferredPlayers={props.preferredPlayers}
        notes={props.notes}
      />
    </>
  );
}
