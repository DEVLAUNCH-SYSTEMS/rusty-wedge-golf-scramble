"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  cancelRegistration,
  rejectRegistrationPayment,
  updateRegistrationNotes,
  verifyRegistrationPayment,
} from "@/lib/services/registration-admin";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function verifyRegistrationPaymentAction(
  registrationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    await verifyRegistrationPayment(registrationId, admin);
    return actionSuccess("Payment verified and registration confirmed.");
  } catch (error) {
    return mapAdminActionError(error, "Admin registration action failed");
  }
}

export async function rejectRegistrationPaymentAction(
  registrationId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const reason = readString(formData, "reason");
    await rejectRegistrationPayment(registrationId, reason, admin);
    return actionSuccess("Payment rejected.");
  } catch (error) {
    return mapAdminActionError(error, "Admin registration action failed");
  }
}

export async function cancelRegistrationAction(
  registrationId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const adminNotes = readString(formData, "adminNotes");
    await cancelRegistration(registrationId, adminNotes, admin);
    return actionSuccess("Registration cancelled.");
  } catch (error) {
    return mapAdminActionError(error, "Admin registration action failed");
  }
}

export async function updateRegistrationNotesAction(
  registrationId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const paymentReviewNotes = readString(formData, "paymentReviewNotes");
    const adminNotes = readString(formData, "adminNotes");

    await updateRegistrationNotes(
      registrationId,
      {
        paymentReviewNotes,
        adminNotes,
      },
      admin,
    );

    return actionSuccess("Notes saved.");
  } catch (error) {
    return mapAdminActionError(error, "Admin registration action failed");
  }
}
