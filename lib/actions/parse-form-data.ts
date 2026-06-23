import { submitRegistrationSchema } from "@/lib/validation/forms";

import type { SubmitRegistrationInput } from "@/lib/validation/forms";

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

export function parseWaitlistFormData(formData: FormData) {
  return parseRegistrationFormData(formData);
}

export function readPaymentProofFile(formData: FormData): File {
  const file = formData.get("paymentProof");

  if (!(file instanceof File)) {
    throw new Error("Payment proof file is required.");
  }

  return file;
}
