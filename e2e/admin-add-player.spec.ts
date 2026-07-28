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

function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}@example.com`;
}

async function fillPlayerProfile(page: Page, email: string): Promise<void> {
  await page.locator('input[name="firstName"]').fill("E2E");
  await page.locator('input[name="lastName"]').fill("AddPlayer");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="phone"]').fill("5095550198");
  await page.locator('select[name="skillLevel"]').selectOption("B");
}

async function openAddPlayerForm(page: Page): Promise<void> {
  await page.goto("/admin/registrations/new");
  await expect(page.getByRole("heading", { name: "Add player" })).toBeVisible();
  // Prove client hydration: waitlist hides payment controls.
  await page.getByRole("radio", { name: "Waitlist" }).check();
  await expect(page.locator('select[name="paymentStatus"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Registration" }).check();
  await expect(page.locator('select[name="paymentStatus"]')).toHaveCount(1);
}

test("H-add-player-auth: add player route requires authentication", async ({
  page,
}) => {
  await page.goto("/admin/registrations/new");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H-add-player-registration: authenticated admin can add a registration", async ({
  page,
}) => {
  test.skip(
    !hasAdminE2EAuth,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for authenticated admin add-player E2E.",
  );

  await signInAsAdmin(page);
  await openAddPlayerForm(page);

  await fillPlayerProfile(page, uniqueEmail("e2e-add-reg"));
  await page.locator('select[name="paymentStatus"]').selectOption("submitted");

  await page.getByRole("button", { name: "Save player" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Player saved; contact them offline if needed.",
  );
});

test("H-add-player-waitlist: authenticated admin can add a waitlist entry", async ({
  page,
}) => {
  test.skip(
    !hasAdminE2EAuth,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for authenticated admin add-player E2E.",
  );

  await signInAsAdmin(page);
  await openAddPlayerForm(page);

  await page.getByRole("radio", { name: "Waitlist" }).check();
  await expect(page.locator('select[name="paymentStatus"]')).toHaveCount(0);

  await fillPlayerProfile(page, uniqueEmail("e2e-add-wl"));
  await page.getByRole("button", { name: "Save player" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Player saved; contact them offline if needed.",
  );
});
