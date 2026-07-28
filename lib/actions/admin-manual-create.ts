"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import {
  parseAdminManualRegistrationFormData,
  parseWaitlistFormData,
  readOptionalPaymentProofFile,
} from "@/lib/actions/parse-form-data";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { createAdminRegistration } from "@/lib/services/registration-admin-create";
import { createAdminWaitlistEntry } from "@/lib/services/waitlist-admin-create";

const SAVED_MESSAGE =
  "Player saved; contact them offline if needed.";

export async function createAdminRegistrationAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const input = parseAdminManualRegistrationFormData(formData);
    const paymentProofFile = readOptionalPaymentProofFile(formData);

    await createAdminRegistration(
      {
        ...input,
        paymentProofFile,
      },
      admin,
    );

    return actionSuccess(SAVED_MESSAGE);
  } catch (error) {
    return mapAdminActionError(error, "Admin manual registration failed");
  }
}

export async function createAdminWaitlistEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const input = parseWaitlistFormData(formData);
    await createAdminWaitlistEntry(input, admin);
    return actionSuccess(SAVED_MESSAGE);
  } catch (error) {
    return mapAdminActionError(error, "Admin manual waitlist create failed");
  }
}
