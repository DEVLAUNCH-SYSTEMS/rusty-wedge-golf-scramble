import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("registration section has no accessibility violations", async ({ page }) => {
  await page.goto("/#register");

  const results = await new AxeBuilder({ page }).include("#register").analyze();

  expect(results.violations).toEqual([]);
});
