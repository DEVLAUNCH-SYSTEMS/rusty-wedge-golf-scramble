import { expect, test } from "@playwright/test";

const forbiddenHtmlPiiPatterns = [
  /payment_proof_path/i,
  /blob\.vercel-storage\.com/i,
  /@example\.com/i,
  /skillLevel/i,
  /registrationStatus/i,
  /team_members/i,
  /registration_id/i,
];

test.describe("public /teams page", () => {
  test("loads and respects publication gate without exposing PII", async ({ page }) => {
    const response = await page.goto("/teams");
    expect(response?.ok()).toBeTruthy();

    const html = await page.content();
    const visibleText = await page.locator("body").innerText();

    for (const pattern of forbiddenHtmlPiiPatterns) {
      expect(html).not.toMatch(pattern);
    }

    const isUnpublished = visibleText.includes("Teams have not been published yet.");
    const isPublished = /Team #\d+/.test(visibleText);

    expect(isUnpublished || isPublished).toBeTruthy();

    if (isUnpublished) {
      expect(visibleText).not.toMatch(/Team #\d+/);
    }
  });

  test("uses landing anchors from /teams header when published nav is visible", async ({
    page,
  }) => {
    await page.goto("/teams");

    const teamsNav = page.getByRole("link", { name: "Teams" });
    const teamsNavCount = await teamsNav.count();

    if (teamsNavCount === 0) {
      test.info().annotations.push({
        type: "note",
        description: "Teams nav hidden while unpublished — expected.",
      });
      return;
    }

    await expect(teamsNav).toHaveAttribute("href", "/teams");

    const eventDetails = page.getByRole("link", { name: "Event Details" });
    await expect(eventDetails).toHaveAttribute("href", "/#about");
  });
});
