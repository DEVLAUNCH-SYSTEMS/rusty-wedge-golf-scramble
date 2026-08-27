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
  await page.goto("/admin/teams");
  await expect(page).toHaveURL(/\/admin\/teams/);
}

test("H-delete-team-auth: teams admin requires authentication", async ({ page }) => {
  await page.goto("/admin/teams");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H-delete-team-empty: authenticated admin can delete an empty team", async ({
  page,
}) => {
  test.skip(
    !hasAdminE2EAuth,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for authenticated admin delete-team E2E.",
  );

  await signInAsAdmin(page);

  await page.getByRole("button", { name: "Create team" }).click();
  await expect(page.getByRole("status")).toContainText(/Team #\d+ created\./i);

  await page.getByRole("button", { name: "Delete" }).last().click();
  await page.getByRole("checkbox", { name: /I understand that this empty team/i }).check();
  await page.getByRole("button", { name: "Delete team" }).click();

  await expect(page.getByRole("status")).toContainText(/deleted/i);
});
