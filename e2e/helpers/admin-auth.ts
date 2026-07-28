import { expect, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();

export const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);

export async function signInAsAdmin(page: Page): Promise<void> {
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

export async function selectAdminTournamentView(
  page: Page,
  tournamentId: string,
): Promise<void> {
  const selector = page.getByLabel("Select tournament view");
  await selector.selectOption(tournamentId);
  await expect(selector).toHaveValue(tournamentId);
}
