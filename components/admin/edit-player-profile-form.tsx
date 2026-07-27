"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { EditPlayerProfileFields } from "@/components/admin/edit-player-profile-fields";
import { updateRegistrationProfileAction } from "@/lib/actions/admin-registration";

type EditPlayerProfileFormProps = {
  registrationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skillLevel: string;
  preferredPlayers: string | null;
  notes: string | null;
  readOnlyReason?: string;
};

export function EditPlayerProfileForm(props: EditPlayerProfileFormProps) {
  return (
    <AdminActionForm
      title="Edit player"
      submitLabel="Save player"
      pendingLabel="Saving…"
      disabled={Boolean(props.readOnlyReason)}
      disabledMessage={props.readOnlyReason}
      onSubmit={(formData) =>
        updateRegistrationProfileAction(props.registrationId, formData)
      }
    >
      <EditPlayerProfileFields
        firstName={props.firstName}
        lastName={props.lastName}
        email={props.email}
        phone={props.phone}
        skillLevel={props.skillLevel}
        preferredPlayers={props.preferredPlayers}
        notes={props.notes}
      />
    </AdminActionForm>
  );
}
