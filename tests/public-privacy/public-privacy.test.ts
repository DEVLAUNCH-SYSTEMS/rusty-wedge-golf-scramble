import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "../..");

const publicSourceRoots = ["app", "components"];

const forbiddenCapacityPatterns = [
  /\b68\b/,
  /spots remaining/i,
  /spots left/i,
  /players registered/i,
  /registration count/i,
  /waitlist count/i,
  /getConfirmedCount/,
  /confirmedCapacityLimit/,
  /confirmed_capacity_limit/,
];

const forbiddenPiiPatterns = [
  /paymentProofPath/i,
  /payment_proof_path/i,
  /registrationStatus/i,
  /payment_status/i,
  /admin_notes/i,
  /blob\.vercel-storage\.com/i,
  /\/api\/.*proof/i,
];

const publicTeamsUiForbiddenPatterns = [
  /registrationId/i,
  /teamMembers\.id/i,
  /teams\.name/i,
  /skillLevel/i,
  /paymentStatus/i,
  /adminNotes/i,
  /proofPath/i,
  /\bemail\b/i,
  /\bphone\b/i,
];

function readSource(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function publicTeamsUiSources(): string[] {
  return [
    "components/marketing/public-teams-page.tsx",
    "components/marketing/public-team-card.tsx",
    "components/marketing/public-team-card-header.tsx",
    "components/marketing/public-team-roster-rows.tsx",
    "components/marketing/teams-not-published.tsx",
    "components/marketing/public-teams-page-intro.tsx",
    "components/marketing/public-page-header-band.tsx",
    "app/teams/page.tsx",
  ].map(readSource);
}

function collectSourceFiles(dirPath: string): string[] {
  const files: string[] = [];

  if (!existsSync(dirPath)) {
    return files;
  }

  for (const entry of readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "admin") {
        continue;
      }

      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function isPublicUiFile(relativePath: string): boolean {
  if (relativePath.startsWith("app/admin")) {
    return false;
  }

  if (relativePath.startsWith("components/")) {
    return true;
  }

  if (relativePath === "app/page.tsx") {
    return true;
  }

  if (relativePath.startsWith("app/") && relativePath.endsWith("/page.tsx")) {
    return !relativePath.includes("/admin/");
  }

  return false;
}

function readPublicUiSources(): string[] {
  const contents: string[] = [];

  for (const root of publicSourceRoots) {
    for (const filePath of collectSourceFiles(path.join(rootDir, root))) {
      const relativePath = path.relative(rootDir, filePath);

      if (!isPublicUiFile(relativePath)) {
        continue;
      }

      contents.push(readFileSync(filePath, "utf8"));
    }
  }

  return contents;
}

describe("public privacy", () => {
  const publicSources = readPublicUiSources();

  it("H3: public UI sources never expose numeric capacity or counters", () => {
    for (const source of publicSources) {
      for (const pattern of forbiddenCapacityPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("H15: public UI sources never expose registration PII or proof URLs", () => {
    for (const source of publicSources) {
      for (const pattern of forbiddenPiiPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("uses boolean capacity gate only on the landing page", () => {
    const pageSource = readSource("app/page.tsx");

    expect(pageSource).toContain("hasRegistrationCapacity");
    expect(pageSource).not.toContain("getConfirmedCount");
  });

  it("H16: /teams route uses publication gate loader", () => {
    const teamsPage = readSource("app/teams/page.tsx");

    expect(teamsPage).toContain("loadPublicTeamsPageData");
    expect(teamsPage).not.toContain("listPublicTeams");
  });

  it("H17: public teams UI uses Team #N identity and avoids legacy team names", () => {
    const cardSources = [
      readSource("components/marketing/public-team-card.tsx"),
      readSource("components/marketing/public-team-card-header.tsx"),
    ].join("\n");

    expect(cardSources).toContain("formatPublicTeamLabel");
    expect(cardSources).not.toMatch(/\bteam\.name\b|\bteams\.name\b/);
  });

  it("H18: public teams UI avoids private registration/team identifiers", () => {
    for (const source of publicTeamsUiSources()) {
      for (const pattern of publicTeamsUiForbiddenPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("H19: public teams list service maps to name-only roster DTO", () => {
    const listSource = readSource("lib/services/public-teams-list.ts");

    expect(listSource).toContain("firstName: registrations.firstName");
    expect(listSource).toContain("lastName: registrations.lastName");
    expect(listSource).toContain("teamNumber: team.teamNumber");
    expect(listSource).not.toMatch(/return\s+teamRows\.map\([\s\S]*\bid\s*:/);
  });
});
