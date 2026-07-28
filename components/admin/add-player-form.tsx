"use client";

import { useState } from "react";

import { AddPlayerPaymentFields } from "@/components/admin/add-player-payment-fields";
import {
  AddPlayerPlacementField,
  type AddPlayerPlacement,
} from "@/components/admin/add-player-placement-field";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { EditPlayerProfileFields } from "@/components/admin/edit-player-profile-fields";
import {
  createAdminRegistrationAction,
  createAdminWaitlistEntryAction,
} from "@/lib/actions/admin-manual-create";

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  skillLevel: "",
  preferredPlayers: null,
  notes: null,
} as const;

function submitAddPlayer(placement: AddPlayerPlacement, formData: FormData) {
  if (placement === "waitlist") {
    return createAdminWaitlistEntryAction(formData);
  }

  return createAdminRegistrationAction(formData);
}

export function AddPlayerForm() {
  const [placement, setPlacement] =
    useState<AddPlayerPlacement>("registration");

  return (
    <AdminActionForm
      title="Player details"
      submitLabel="Save player"
      pendingLabel="Saving…"
      onSubmit={(formData) => submitAddPlayer(placement, formData)}
    >
      <AddPlayerPlacementField
        placement={placement}
        onPlacementChange={setPlacement}
      />
      <EditPlayerProfileFields {...EMPTY_PROFILE} />
      {placement === "registration" ? <AddPlayerPaymentFields /> : null}
    </AdminActionForm>
  );
}
