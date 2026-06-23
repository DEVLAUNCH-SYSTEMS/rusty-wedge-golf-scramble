import { expect, test } from "@playwright/test";

test("H12: unauthenticated users are redirected from admin routes", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H14: payment proof API requires authentication", async ({ request }) => {
  const response = await request.get(
    "/api/admin/payment-proofs/00000000-0000-0000-0000-000000000001",
  );

  expect([401, 403]).toContain(response.status());
});

test("H18: export routes require authentication", async ({ request }) => {
  const registrations = await request.get("/api/admin/export/registrations");
  const teams = await request.get("/api/admin/export/teams");

  expect([401, 403]).toContain(registrations.status());
  expect([401, 403]).toContain(teams.status());
});
