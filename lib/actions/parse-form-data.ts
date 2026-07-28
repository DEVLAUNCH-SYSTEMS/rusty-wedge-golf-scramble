import { adminManualPaymentStatusSchema } from "@/lib/services/admin-manual-payment";
import {
  submitRegistrationSchema,
  updateRegistrationProfileSchema,
} from "@/lib/validation/forms";

import type { AdminManualPaymentStatus } from "@/lib/services/admin-manual-payment";
import type {
  SubmitRegistrationInput,
  UpdateRegistrationProfileInput,
} from "@/lib/validation/forms";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function parseRegistrationFormData(
  formData: FormData,
): SubmitRegistrationInput {
  return submitRegistrationSchema.parse({
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    skillLevel: readString(formData, "skillLevel"),
    preferredPlayers: readString(formData, "preferredPlayers") || undefined,
    notes: readString(formData, "notes") || undefined,
  });
}

export function parseUpdateRegistrationProfileFormData(
  formData: FormData,
): UpdateRegistrationProfileInput {
  return updateRegistrationProfileSchema.parse({
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    skillLevel: readString(formData, "skillLevel"),
    preferredPlayers: readString(formData, "preferredPlayers") || undefined,
    notes: readString(formData, "notes") || undefined,
  });
}

export function parseWaitlistFormData(formData: FormData) {
  return parseRegistrationFormData(formData);
}

export type AdminManualRegistrationFormInput = SubmitRegistrationInput & {
  paymentStatus: AdminManualPaymentStatus;
};

export function parseAdminManualRegistrationFormData(
  formData: FormData,
): AdminManualRegistrationFormInput {
  return {
    ...parseRegistrationFormData(formData),
    paymentStatus: adminManualPaymentStatusSchema.parse(
      readString(formData, "paymentStatus"),
    ),
  };
}

export function readPaymentProofFile(formData: FormData): File {
  const file = formData.get("paymentProof");

  if (!(file instanceof File)) {
    throw new Error("Payment proof file is required.");
  }

  return file;
}

/** Admin manual create — empty or missing file means omit proof. */
export function readOptionalPaymentProofFile(formData: FormData): File | null {
  const file = formData.get("paymentProof");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}
