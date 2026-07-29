import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();
const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);
const hasCreateE2E = hasAdminE2EAuth && Boolean(process.env.DATABASE_URL);

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

test("H-tournament-create-auth: create tournament page requires authentication", async ({
  page,
}) => {
  await page.goto("/admin/tournaments/new");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H-tournament-create-submit: admin can create a draft tournament", async ({
  page,
}) => {
  test.skip(
    !hasCreateE2E,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and DATABASE_URL for create E2E.",
  );

  const year = 2090 + Math.floor(Math.random() * 1000);
  const slug = `${year}-e2e-create-test`;
  const name = `E2E Create Test ${year}`;

  await signInAsAdmin(page);
  await page.goto("/admin/tournaments/new");
  await expect(page.getByRole("heading", { name: "Create tournament" })).toBeVisible();

  await page.getByLabel("Year").fill(String(year));
  await page.getByLabel("Tournament name").fill(name);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Event date").fill(`${year}-06-15`);
  await page.getByLabel("Location").fill("E2E Test Course");
  await page.getByLabel("Entry fee (USD)").fill("85.00");
  await page.getByLabel("Confirmed capacity").fill("68");
  await page.getByLabel("Venmo handle").fill("@e2ecreate");
  await page.getByRole("button", { name: "Create draft tournament" }).click();

  await expect(page).toHaveURL(/\/admin\/tournaments$/);
  await expect(page.getByRole("cell", { name: String(year) })).toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
});
