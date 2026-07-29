import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim();
const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim();
const hasAdminE2EAuth = Boolean(adminEmail && adminPassword);
const hasMultiYearE2E = hasAdminE2EAuth && Boolean(process.env.DATABASE_URL);

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

async function selectAdminTournamentView(
  page: Page,
  tournamentId: string,
): Promise<void> {
  const selector = page.getByLabel("Select tournament view");
  await selector.selectOption(tournamentId);
  await expect(selector).toHaveValue(tournamentId);
}

test("H-multi-year-switch: admin tournament selector scopes registration lists", async ({
  page,
}) => {
  test.skip(
    !hasMultiYearE2E,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and DATABASE_URL for multi-year E2E.",
  );

  const multiYear = await import("./helpers/multi-year-test-tournament");
  const fixture = await multiYear.seedMultiYearE2EFixture();

  try {
    await signInAsAdmin(page);
    await page.goto("/admin/registrations");

    await expect(page.getByText(fixture.draftEmail)).toHaveCount(0);

    await selectAdminTournamentView(page, fixture.draftTournamentId);
    await expect(page.getByText(fixture.draftEmail)).toBeVisible();
    await expect(page.getByText(multiYear.E2E_MULTI_YEAR_PLAYER_LAST_NAME)).toBeVisible();

    await selectAdminTournamentView(page, fixture.activeTournamentId);
    await expect(page.getByText(fixture.draftEmail)).toHaveCount(0);
  } finally {
    await multiYear.deleteMultiYearE2EFixture(fixture.draftTournamentId);
  }
});

test("H-multi-year-export: CSV export follows the selected tournament context", async ({
  page,
}) => {
  test.skip(
    !hasMultiYearE2E,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and DATABASE_URL for multi-year E2E.",
  );

  const multiYear = await import("./helpers/multi-year-test-tournament");
  const fixture = await multiYear.seedMultiYearE2EFixture();

  try {
    await signInAsAdmin(page);
    await selectAdminTournamentView(page, fixture.draftTournamentId);

    const response = await page.request.get(
      `/api/admin/export/registrations?tournamentId=${fixture.draftTournamentId}`,
    );

    expect(response.ok()).toBeTruthy();

    const csv = await response.text();

    expect(csv).toContain(fixture.draftEmail);
    expect(csv).toContain("first_name");
  } finally {
    await multiYear.deleteMultiYearE2EFixture(fixture.draftTournamentId);
  }
});

test("H-multi-year-create-switch-export: create, switch, and export stay isolated", async ({
  page,
}) => {
  test.skip(
    !hasMultiYearE2E,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and DATABASE_URL for multi-year E2E.",
  );

  const multiYear = await import("./helpers/multi-year-test-tournament");
  const year = 2090 + Math.floor(Math.random() * 1000);
  const slug = `${year}-e2e-multi-year-flow`;
  const name = `E2E Multi-Year Flow ${year}`;

  await signInAsAdmin(page);
  await page.goto("/admin/tournaments/new");

  await page.getByLabel("Year").fill(String(year));
  await page.getByLabel("Tournament name").fill(name);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Event date").fill(`${year}-06-15`);
  await page.getByLabel("Location").fill("E2E Test Course");
  await page.getByLabel("Entry fee (USD)").fill("85.00");
  await page.getByLabel("Confirmed capacity").fill("68");
  await page.getByLabel("Venmo handle").fill("@e2emultiyear");
  await page.getByRole("button", { name: "Create draft tournament" }).click();

  await expect(page).toHaveURL(/\/admin\/tournaments$/);
  await expect(page.getByRole("cell", { name: String(year) })).toBeVisible();

  const createdOption = page
    .getByLabel("Select tournament view")
    .locator("option")
    .filter({ hasText: `${year} — ${name}` });
  const createdTournamentId = await createdOption.getAttribute("value");

  expect(createdTournamentId).toBeTruthy();

  await selectAdminTournamentView(page, createdTournamentId!);
  await page.goto("/admin/registrations");
  await expect(page.getByText(String(year))).toBeVisible();
  await expect(
    page.getByText("No registrations match these filters."),
  ).toBeVisible();

  const exportResponse = await page.request.get(
    `/api/admin/export/registrations?tournamentId=${createdTournamentId}`,
  );

  expect(exportResponse.ok()).toBeTruthy();
  expect(await exportResponse.text()).toContain("first_name");

  await page.goto("/");
  await expect(page.getByText(name)).toHaveCount(0);
  await expect(page.getByText(multiYear.E2E_MULTI_YEAR_TOURNAMENT_NAME)).toHaveCount(0);
});
