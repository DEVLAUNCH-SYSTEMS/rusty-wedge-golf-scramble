import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { ServiceError } from "@/lib/services/service-error";

import {
  createIntegrationAdminRegistration,
  createIntegrationAdminWaitlistEntry,
  createTestAdminSession,
  uniqueTestEmail,
} from "./helpers";

const profile = {
  firstName: "Wait",
  lastName: "Listed",
  phone: "5095550199",
  skillLevel: "B" as const,
};

describe.skipIf(!hasIntegrationDatabase())("admin waitlist create", () => {
  it("blocks duplicate active waitlist email", async () => {
    const admin = await createTestAdminSession();
    const email = uniqueTestEmail("admin-waitlist-dup");

    await createIntegrationAdminWaitlistEntry({ ...profile, email }, admin);

    await expect(
      createIntegrationAdminWaitlistEntry({ ...profile, email }, admin),
    ).rejects.toMatchObject({
      code: "DUPLICATE_WAITLIST",
    } satisfies Partial<ServiceError>);
  });

  it("blocks waitlist create when email already has an active registration", async () => {
    const admin = await createTestAdminSession();
    const email = uniqueTestEmail("admin-wl-reg-exists");

    await createIntegrationAdminRegistration(
      { ...profile, email, paymentStatus: "submitted" },
      admin,
    );

    await expect(
      createIntegrationAdminWaitlistEntry({ ...profile, email }, admin),
    ).rejects.toMatchObject({
      code: "EMAIL_ALREADY_REGISTERED",
    } satisfies Partial<ServiceError>);
  });
});
