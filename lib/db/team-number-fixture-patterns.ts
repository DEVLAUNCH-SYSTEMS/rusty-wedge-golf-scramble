export const TEAM_NUMBER_PARSE_PATTERN = String.raw`^Team\s*#\s*(\d+)`;

export type FixturePatternMatch = {
  patternId: string;
  label: string;
  evidence: string;
};

const EXACT_FIXTURE_NAMES: FixturePatternMatch[] = [
  {
    patternId: "audit-team",
    label: "Audit Team",
    evidence: "tests/integration/audit.integration.test.ts (createTeam)",
  },
  {
    patternId: "integration-team-a",
    label: "Integration Team A",
    evidence: "tests/integration/teams.integration.test.ts (createTeam)",
  },
  {
    patternId: "integration-team-b",
    label: "Integration Team B",
    evidence: "tests/integration/teams.integration.test.ts (createTeam)",
  },
  {
    patternId: "archived-guard-team",
    label: "Archived Guard Team",
    evidence:
      "tests/integration/archived-tournament-readonly.integration.test.ts (rejected createTeam — unlikely persisted)",
  },
];

const REGEX_FIXTURE_PATTERNS: Array<
  FixturePatternMatch & { regex: RegExp }
> = [
  {
    patternId: "h-edit-team-uuid",
    label: "H-edit team {uuid}",
    evidence:
      "tests/integration/registration-profile-update.integration.test.ts (createTeam with randomUUID)",
    regex:
      /^H-edit team [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  {
    patternId: "delete-test-team-uuid",
    label: "Delete Test {label} {uuid}",
    evidence:
      "tests/integration/team-delete.integration.test.ts (uniqueDeleteTestTeamName)",
    regex:
      /^Delete Test (empty|populated|keep|remove|other-tournament) [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
];

export function classifyFixtureTeamName(name: string): FixturePatternMatch | null {
  const exact = EXACT_FIXTURE_NAMES.find((entry) => entry.label === name);

  if (exact) {
    return exact;
  }

  return REGEX_FIXTURE_PATTERNS.find((entry) => entry.regex.test(name)) ?? null;
}

export function listFixturePatternCatalog(): FixturePatternMatch[] {
  return [
    ...EXACT_FIXTURE_NAMES,
    ...REGEX_FIXTURE_PATTERNS.map(({ patternId, label, evidence }) => ({
      patternId,
      label,
      evidence,
    })),
  ];
}
