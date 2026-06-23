import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("waitlist form has no accessibility violations when registration is full", async ({
  page,
}) => {
  await page.goto("/#register");

  const waitlistForm = page.getByRole("form", { name: "Tournament waitlist" });

  if ((await waitlistForm.count()) === 0) {
    test.skip(true, "Waitlist form renders only when tournament capacity is full.");
  }

  const results = await new AxeBuilder({ page })
    .include('[aria-label="Tournament waitlist"]')
    .analyze();

  expect(results.violations).toEqual([]);
});
