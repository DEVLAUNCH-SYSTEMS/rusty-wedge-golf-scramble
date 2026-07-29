import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();
const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);
const hasLifecycleE2E = hasAdminE2EAuth && Boolean(process.env.DATABASE_URL);

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

function tournamentRow(page: Page, year: number) {
  return page.locator("tr").filter({ hasText: String(year) });
}

test("H-tournament-lifecycle-auth: tournaments page requires authentication", async ({
  page,
}) => {
  await page.goto("/admin/tournaments");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("H-tournament-lifecycle-archive-restore: admin can archive and restore a tournament", async ({
  page,
}) => {
  test.skip(
    !hasLifecycleE2E,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and DATABASE_URL for lifecycle E2E.",
  );

  const lifecycle = await import("./helpers/lifecycle-test-tournament");
  const tournament = await lifecycle.seedLifecycleE2ETournament("completed");

  try {
    await signInAsAdmin(page);
    await page.goto("/admin/tournaments");
    await expect(page.getByRole("heading", { name: "Tournaments" })).toBeVisible();

    const row = tournamentRow(page, tournament.year);
    await expect(row.getByText(lifecycle.E2E_LIFECYCLE_TOURNAMENT_NAME)).toBeVisible();
    await expect(row.getByText("Completed")).toBeVisible();

    await row.locator('input[name="confirmYear"]').fill(String(tournament.year));
    await row.getByRole("button", { name: "Archive tournament" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Tournament updated to Archived.",
    );
    await expect(row.getByText("Archived")).toBeVisible();

    await row.getByRole("checkbox").check();
    await row.getByRole("button", { name: "Restore from archive" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Tournament updated to Completed.",
    );
    await expect(row.getByText("Completed")).toBeVisible();
  } finally {
    await lifecycle.deleteLifecycleE2ETournament(tournament.id);
  }
});
