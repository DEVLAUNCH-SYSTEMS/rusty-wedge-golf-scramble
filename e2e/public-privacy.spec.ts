import { expect, test } from "@playwright/test";

const forbiddenPatterns = [
  /\b68\b/,
  /spots remaining/i,
  /waitlist count/i,
  /payment_proof_path/i,
  /blob\.vercel-storage\.com/i,
];

test("H3 + H15: public home page hides capacity counts and registration PII", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  const html = await page.content();

  for (const pattern of forbiddenPatterns) {
    expect(html).not.toMatch(pattern);
  }
});
