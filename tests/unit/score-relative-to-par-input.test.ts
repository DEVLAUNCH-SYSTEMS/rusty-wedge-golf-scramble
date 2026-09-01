import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scoreRelativeInputPath = join(
  process.cwd(),
  "components/admin/score-relative-to-par-input.tsx",
);

describe("score relative-to-par input presentation", () => {
  it("uses a text input for golf notation instead of native number behavior", () => {
    const source = readFileSync(scoreRelativeInputPath, "utf8");

    expect(source).toMatch(/type="text"/);
    expect(source).not.toMatch(/type="number"/);
  });
});
