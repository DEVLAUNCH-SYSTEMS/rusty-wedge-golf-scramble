import { expect, test } from "@playwright/test";

const forbiddenVisibleCapacityPatterns = [
  /\b68\b/,
  /spots remaining/i,
  /waitlist count/i,
];

const forbiddenHtmlPiiPatterns = [
  /payment_proof_path/i,
  /blob\.vercel-storage\.com/i,
];

test("H3 + H15: public home page hides capacity counts and registration PII", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  const visibleText = await page.locator("body").innerText();

  for (const pattern of forbiddenVisibleCapacityPatterns) {
    expect(visibleText).not.toMatch(pattern);
  }

  const html = await page.content();

  for (const pattern of forbiddenHtmlPiiPatterns) {
    expect(html).not.toMatch(pattern);
  }
});
