import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();
const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);

async function signInAsAdmin(page: Page): Promise<void> {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: adminEmail,
      password: adminPassword,
    },
  });

  expect(response.ok(), `Admin sign-in failed: ${response.status()}`).toBeTruthy();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/);
}

test("H-edit-player-auth: registration detail edit route requires authentication", async ({
  page,
}) => {
  await page.goto(
    "/admin/registrations/00000000-0000-0000-0000-000000000001",
  );

  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H-edit-player: authenticated admin can update a player profile", async ({
  page,
}) => {
  test.skip(
    !hasAdminE2EAuth,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for authenticated admin edit E2E.",
  );

  await signInAsAdmin(page);
  await page.goto("/admin/registrations");

  // Prefer a registration detail link (UUID path), not the /new CTA.
  const detailLink = page
    .locator('a[href^="/admin/registrations/"][href*="-"]')
    .first();

  if ((await detailLink.count()) === 0) {
    test.skip(
      true,
      "No registrations available to edit. Seed or create a registration first.",
    );
  }

  await detailLink.click();
  await expect(page.getByRole("heading", { name: "Edit player" })).toBeVisible();

  const uniqueSuffix = Date.now().toString().slice(-6);
  const lastNameInput = page.locator('input[name="lastName"]');
  await lastNameInput.fill(`Edited${uniqueSuffix}`);
  await expect(lastNameInput).toHaveValue(`Edited${uniqueSuffix}`);

  await page.getByRole("button", { name: "Save player" }).click();
  await expect(page.getByRole("status")).toContainText("Player profile updated.");
  await expect(page.locator('input[name="lastName"]')).toHaveValue(
    `Edited${uniqueSuffix}`,
  );
});
