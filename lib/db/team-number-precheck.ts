import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { loadEnvFiles } from "@/lib/db/load-env";
import {
  describeMigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";
import {
  classifyFixtureTeamName,
  listFixturePatternCatalog,
  TEAM_NUMBER_PARSE_PATTERN,
} from "@/lib/db/team-number-fixture-patterns";

loadEnvFiles();

type PrecheckRow = Record<string, unknown>;

type SummaryCounts = {
  totalTeams: number;
  successfullyNumbered: number;
  nullTeamNumber: number;
  unparseableNames: number;
  parseableButNull: number;
  duplicateNumberGroups: number;
  duplicateNumberRows: number;
  zeroMemberTeams: number;
  populatedTeams: number;
  fixtureArtifactTeams: number;
};

function logSection(title: string): void {
  console.log(`\n## ${title}`);
}

function logRows(rows: PrecheckRow[]): void {
  if (rows.length === 0) {
    console.log("(none)");
    return;
  }

  console.log(JSON.stringify(rows, null, 2));
}

async function fetchSummaryCounts(): Promise<SummaryCounts> {
  const db = getDb();
  const result = await db.execute(sql`
    WITH member_counts AS (
      SELECT
        t.id,
        t.name,
        t.team_number,
        t.tournament_id,
        count(tm.id)::int AS member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      GROUP BY t.id, t.name, t.team_number, t.tournament_id
    ),
    duplicate_groups AS (
      SELECT tournament_id, team_number, count(*)::int AS team_count
      FROM member_counts
      WHERE team_number IS NOT NULL
      GROUP BY tournament_id, team_number
      HAVING count(*) > 1
    )
    SELECT
      (SELECT count(*)::int FROM member_counts) AS total_teams,
      (SELECT count(*)::int FROM member_counts WHERE team_number IS NOT NULL) AS successfully_numbered,
      (SELECT count(*)::int FROM member_counts WHERE team_number IS NULL) AS null_team_number,
      (SELECT count(*)::int FROM member_counts WHERE name !~ ${TEAM_NUMBER_PARSE_PATTERN}) AS unparseable_names,
      (SELECT count(*)::int FROM member_counts WHERE name ~ ${TEAM_NUMBER_PARSE_PATTERN} AND team_number IS NULL) AS parseable_but_null,
      (SELECT count(*)::int FROM duplicate_groups) AS duplicate_number_groups,
      (SELECT coalesce(sum(team_count), 0)::int FROM duplicate_groups) AS duplicate_number_rows,
      (SELECT count(*)::int FROM member_counts WHERE member_count = 0) AS zero_member_teams,
      (SELECT count(*)::int FROM member_counts WHERE member_count > 0) AS populated_teams
  `);

  const row = result.rows[0] as PrecheckRow;
  const allTeams = await db.execute(sql`
    SELECT name FROM teams
  `);

  let fixtureArtifactTeams = 0;

  for (const teamRow of allTeams.rows as { name: string }[]) {
    if (classifyFixtureTeamName(teamRow.name)) {
      fixtureArtifactTeams += 1;
    }
  }

  return {
    totalTeams: Number(row.total_teams),
    successfullyNumbered: Number(row.successfully_numbered),
    nullTeamNumber: Number(row.null_team_number),
    unparseableNames: Number(row.unparseable_names),
    parseableButNull: Number(row.parseable_but_null),
    duplicateNumberGroups: Number(row.duplicate_number_groups),
    duplicateNumberRows: Number(row.duplicate_number_rows),
    zeroMemberTeams: Number(row.zero_member_teams),
    populatedTeams: Number(row.populated_teams),
    fixtureArtifactTeams,
  };
}

async function listTeamsByTournament(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      tr.year,
      tr.slug,
      tr.is_active,
      tr.lifecycle_status,
      tr.teams_published,
      count(t.id)::int AS total_teams,
      count(t.team_number)::int AS numbered_teams,
      count(*) FILTER (WHERE t.team_number IS NULL)::int AS null_team_number,
      count(*) FILTER (WHERE t.name !~ ${TEAM_NUMBER_PARSE_PATTERN})::int AS unparseable_names,
      count(*) FILTER (WHERE t.name ~ ${TEAM_NUMBER_PARSE_PATTERN} AND t.team_number IS NULL)::int AS parseable_but_null,
      count(*) FILTER (WHERE coalesce(mc.member_count, 0) = 0)::int AS zero_member_teams,
      count(*) FILTER (WHERE coalesce(mc.member_count, 0) > 0)::int AS populated_teams
    FROM teams t
    JOIN tournaments tr ON tr.id = t.tournament_id
    LEFT JOIN (
      SELECT team_id, count(*)::int AS member_count
      FROM team_members
      GROUP BY team_id
    ) mc ON mc.team_id = t.id
    GROUP BY tr.id, tr.year, tr.slug, tr.is_active, tr.lifecycle_status, tr.teams_published
    ORDER BY tr.is_active DESC, tr.year DESC, tr.slug
  `);

  return result.rows as PrecheckRow[];
}

async function listDuplicateNumbers(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      tr.year,
      tr.slug,
      t.tournament_id,
      t.team_number,
      count(*)::int AS team_count,
      array_agg(t.name ORDER BY t.name) AS team_names
    FROM teams t
    JOIN tournaments tr ON tr.id = t.tournament_id
    WHERE t.team_number IS NOT NULL
    GROUP BY tr.year, tr.slug, t.tournament_id, t.team_number
    HAVING count(*) > 1
    ORDER BY tr.year DESC, tr.slug, t.team_number
  `);

  return result.rows as PrecheckRow[];
}

async function listUnparseableTeams(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      tr.year,
      tr.slug,
      tr.is_active,
      t.id,
      t.name,
      t.team_number,
      coalesce(mc.member_count, 0)::int AS member_count
    FROM teams t
    JOIN tournaments tr ON tr.id = t.tournament_id
    LEFT JOIN (
      SELECT team_id, count(*)::int AS member_count
      FROM team_members
      GROUP BY team_id
    ) mc ON mc.team_id = t.id
    WHERE t.name !~ ${TEAM_NUMBER_PARSE_PATTERN}
    ORDER BY tr.is_active DESC, tr.year DESC, tr.slug, t.name
    LIMIT 50
  `);

  return result.rows as PrecheckRow[];
}

async function listParseableButNullTeams(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      tr.year,
      tr.slug,
      tr.is_active,
      t.id,
      t.name,
      (regexp_match(t.name, ${TEAM_NUMBER_PARSE_PATTERN}))[1]::integer AS parsed_number,
      coalesce(mc.member_count, 0)::int AS member_count
    FROM teams t
    JOIN tournaments tr ON tr.id = t.tournament_id
    LEFT JOIN (
      SELECT team_id, count(*)::int AS member_count
      FROM team_members
      GROUP BY team_id
    ) mc ON mc.team_id = t.id
    WHERE t.name ~ ${TEAM_NUMBER_PARSE_PATTERN}
      AND t.team_number IS NULL
    ORDER BY tr.year DESC, tr.slug, parsed_number, t.name
  `);

  return result.rows as PrecheckRow[];
}

async function listFixtureArtifactSummary(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      t.id,
      t.name,
      tr.year,
      tr.slug,
      tr.is_active,
      t.team_number,
      coalesce(mc.member_count, 0)::int AS member_count
    FROM teams t
    JOIN tournaments tr ON tr.id = t.tournament_id
    LEFT JOIN (
      SELECT team_id, count(*)::int AS member_count
      FROM team_members
      GROUP BY team_id
    ) mc ON mc.team_id = t.id
    ORDER BY tr.is_active DESC, tr.year DESC, t.name
  `);

  const grouped = new Map<
    string,
    {
      patternId: string;
      label: string;
      evidence: string;
      total: number;
      zeroMember: number;
      populated: number;
      nullTeamNumber: number;
    }
  >();

  for (const row of result.rows as Array<{
    name: string;
    member_count: number;
    team_number: number | null;
  }>) {
    const match = classifyFixtureTeamName(row.name);

    if (!match) {
      continue;
    }

    const existing = grouped.get(match.patternId) ?? {
      patternId: match.patternId,
      label: match.label,
      evidence: match.evidence,
      total: 0,
      zeroMember: 0,
      populated: 0,
      nullTeamNumber: 0,
    };

    existing.total += 1;

    if (row.member_count === 0) {
      existing.zeroMember += 1;
    } else {
      existing.populated += 1;
    }

    if (row.team_number === null) {
      existing.nullTeamNumber += 1;
    }

    grouped.set(match.patternId, existing);
  }

  return [...grouped.values()];
}

function logSummary(summary: SummaryCounts): void {
  console.log(JSON.stringify(summary, null, 2));
}

async function runPrecheck(): Promise<number> {
  const target = describeMigrationDatabaseTarget();
  console.log("Team number precheck (read-only)");
  console.log(`Hostname: ${target.hostname}`);
  console.log(`Database: ${target.database}`);

  const validationError = validateMigrationDatabaseTarget(target);

  if (validationError) {
    console.error(`::error::${validationError}`);
    return 1;
  }

  logSection("Fixture pattern catalog (repository evidence)");
  logRows(listFixturePatternCatalog() as unknown as PrecheckRow[]);

  const summary = await fetchSummaryCounts();
  logSection("Summary counts");
  logSummary(summary);

  logSection("Counts grouped by tournament");
  logRows(await listTeamsByTournament());

  logSection("Duplicate numeric team numbers per tournament");
  logRows(await listDuplicateNumbers());

  logSection("Unparseable team names (sample up to 50)");
  logRows(await listUnparseableTeams());

  logSection("Parseable Team #N names still NULL (ambiguous duplicates)");
  logRows(await listParseableButNullTeams());

  logSection("Recognized test/fixture artifact teams (informational — still block Phase C)");
  logRows(await listFixtureArtifactSummary());

  let exitCode = 0;

  if (summary.nullTeamNumber > 0) {
    console.error(
      `\n::error::${summary.nullTeamNumber} team row(s) still have NULL team_number.`,
    );
    exitCode = 1;
  }

  if (summary.duplicateNumberGroups > 0) {
    console.error(
      `\n::error::${summary.duplicateNumberGroups} duplicate team_number group(s) within tournaments (${summary.duplicateNumberRows} row(s)).`,
    );
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log("\nPrecheck complete — no NULL or duplicate team_number rows remain.");
  } else {
    console.log(
      "\nPrecheck failed — resolve blockers before Phase C (Slice 5). Fixture artifacts are reported separately for Gate A planning; they still count toward blockers until removed or numbered.",
    );
  }

  return exitCode;
}

runPrecheck()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error("Team number precheck failed:", error);
    process.exit(1);
  });
