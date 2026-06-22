import { describe, expect, it } from "vitest";

import { escapeCsvCell, formatCsvRow } from "@/lib/services/csv";

describe("escapeCsvCell", () => {
  it("prefixes spreadsheet formula characters", () => {
    expect(escapeCsvCell("=CMD()")).toBe("'=CMD()");
    expect(escapeCsvCell("+1234")).toBe("'+1234");
    expect(escapeCsvCell("-1234")).toBe("'-1234");
    expect(escapeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("quotes cells containing commas or newlines", () => {
    expect(escapeCsvCell("last, first")).toBe('"last, first"');
    expect(escapeCsvCell('say "hello"')).toBe('"say ""hello"""');
  });

  it("formats a full row with escaped values", () => {
    expect(formatCsvRow(["name", "=evil()", "ok"])).toBe(
      "name,'=evil(),ok",
    );
  });
});
