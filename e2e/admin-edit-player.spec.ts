import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();
const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);

async function signInAsAdmin(page: Page): Promise<void> {
  await page.goto("/auth/sign-in");
  await page.locator('input[type="email"]').fill(adminEmail!);
  await page.locator('input[type="password"]').fill(adminPassword!);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
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

  const playerLink = page.locator('a[href^="/admin/registrations/"]').first();
  if ((await playerLink.count()) === 0) {
    test.skip(
      true,
      "No registrations available to edit. Seed or create a registration first.",
    );
  }

  await playerLink.click();
  await expect(page.getByRole("heading", { name: "Edit player" })).toBeVisible();

  const uniqueSuffix = Date.now().toString().slice(-6);
  const lastNameInput = page.locator('input[name="lastName"]');
  await lastNameInput.fill(`Edited${uniqueSuffix}`);

  await page.getByRole("button", { name: "Save player" }).click();
  await expect(page.getByRole("status")).toContainText("Player profile updated.");
  await expect(page.locator('input[name="lastName"]')).toHaveValue(
    `Edited${uniqueSuffix}`,
  );
});
