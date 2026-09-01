import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const adminTeamsTablePath = join(
  process.cwd(),
  "components/admin/teams-desktop-table.tsx",
);

describe("admin teams table presentation", () => {
  it("does not render a Created column in the desktop table", () => {
    const source = readFileSync(adminTeamsTablePath, "utf8");

    expect(source).not.toMatch(/>\s*Created\s*</);
  });

  it("renders a Score column in the normal read-only desktop table", () => {
    const source = readFileSync(adminTeamsTablePath, "utf8");

    expect(source).toMatch(/>\s*Score\s*</);
  });
});
